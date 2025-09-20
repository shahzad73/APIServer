//   Access Token    access-sandbox-5ab02615-9ccb-4800-ad5e-000dfb12d316  

import { ACHClass, AuthGetRequest, Configuration, CountryCode, PlaidApi, PlaidEnvironments, Products, TransferIntentCreateMode, TransferListRequest, TransferNetwork, TransferType } from "plaid";
import { Request, Response } from "express";
import { AccountsGetResponse } from "plaid";


const router = require('express').Router();
import { ProcessorTokenCreateRequestProcessorEnum } from 'plaid'; 


// Initialize Plaid client
const plaidConfig = new Configuration({
    basePath: PlaidEnvironments.sandbox!, // Use 'development' or 'production' as needed
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": "67c02c9bed73f6002772e835",
        "PLAID-SECRET": "73a4d88401eef5625edb693c94766c",
      },
    },
});

const plaidClient = new PlaidApi(plaidConfig);

var accessToken = "-";

// Route to create a Link token (for frontend to initiate Plaid Link)
router.get("/create-link-token", async (req: any, res: any) => {
    try {

        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: "user1" },
            client_name: "My App",
            products: [Products.Auth], // Change based on required features
            country_codes: [CountryCode.Us],
            language: "en",
            //redirect_uri: process.env.PLAID_REDIRECT_URI, // Optional
        });

        console.log( response.data )

        res.json(response.data);
    } catch (error: any) {
        console.error("Error creating Link token:", error.response?.data || error);
        res.status(500).json({ error: "Failed to create Link token" });
    }
});

// Route to exchange public token for access token
router.post("/exchange-public-token", async (req: any, res: any) => {
    try {
        const { public_token } = req.body;
        const response = await plaidClient.itemPublicTokenExchange({ public_token });

        accessToken = response.data.access_token;
        console.log("Access Token is: " + accessToken );
        res.json({ access_token: accessToken });
    } catch (error: any) {
        console.error("Error exchanging public token:", error.response?.data || error);
        res.status(500).json({ error: "Failed to exchange token" });
    }
});

router.post("/get_Updated_Link_Token", async (req: any, res: any) => {

    try {
        console.log("current access token - " + accessToken );
        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: "user1" },
            client_name: "My App",
            products: [Products.Auth], // Change based on required features
            country_codes: [CountryCode.Us],
            access_token: accessToken, // this enables update mode
            language: "en",
            //redirect_uri: process.env.PLAID_REDIRECT_URI, // Optional
        });

        console.log( response.data )

        res.json(response.data);
    } catch (error: any) {
        console.error("Error creating Link token:", error.response?.data || error);
        res.status(500).json({ error: "Failed to create Link token" });
    }

});

//http://localhost:3000/accounts
router.get("/accounts", async (req: any, res: any) => {

    try {
        const response = await plaidClient.accountsGet({ access_token: accessToken });
        res.json(response.data);
    } catch (error: any) {
        console.error("Error fetching accounts:", error.response?.data || error);
        res.status(500).json({ error: "Failed to fetch account data" });
    }
});

//http://localhost:3000/identityget
router.get("/identityget", async (req: any, res: any) => {

    if (!accessToken) {
        accessToken = "access-sandbox-5ab02615-9ccb-4800-ad5e-000dfb12d316";
    }

    const request = {
        access_token: accessToken,
    };    
    const response = await plaidClient.identityGet(request);
    const identities = response.data.accounts.flatMap(
      (account) => account.owners,
    );
    
    const balances = await plaidClient.accountsBalanceGet( request );
    res.json({ 
        "identities": identities,
        "balances": balances.data.accounts
    });

})

//http://localhost:3000/getAccountInfo
router.get("/getAccountInfo", async (req: any, res: any)  => {

        //  The /auth/get endpoint returns the bank account and bank identification numbers
        //  (such as routing numbers, for US accounts) associated with an Item's checking, savings, 
        //  and cash management accounts, 

        const request: AuthGetRequest = {
            access_token: accessToken,
        };
        try {
            const response = await plaidClient.authGet(request);
            const accountData = response.data.accounts;
            const numbers = response.data.numbers;

            res.json({
                accountData: accountData,
                numbers: numbers       // this includes routing numbers etc of this account
            })

        } catch (error) {
            // handle error
        }
});



// http://localhost:3000/getPaymentProcessorToken
router.get("/getPaymentProcessorToken", async (req: any, res: any)  => {

     // to process peer to peer transaction that is investor to issuer transaction    
     // you need a payment processor.   
     // step 1.  first enable payment processor in integrations in plaid dashboard 
     // strip needs some special enabling      others just need keys in plaid to enable
     // step 2    second call and get account details
     // step 3    get processorTokenCreate   and this is what you need to provide to payment processor to enable peer to peer transaction
     // step 4    optionally some needs  receiver identities      for that 


      
      try {

        const request = {
            access_token: accessToken,
        };

        //Step 1 
        const response = await plaidClient.accountsGet(request);
        const data: AccountsGetResponse = response.data;        
        const accounts = data.accounts;
        
        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts found");
        }

        const accountId = accounts?.[0]?.account_id;
        if (!accountId) {
          throw new Error("No accounts found");
        }
        console.log("Using account:", accountId);


      // step 3    get account identities

        const response3 = await plaidClient.identityGet(request);
        const identities = response3.data.accounts.flatMap(
          (account) => account.owners,
        );
        console.log(identities);
        const balances = await plaidClient.accountsBalanceGet( request );
        console.log({ 
            "identities": identities,
            "balances": balances.data.accounts
        });


        // Step 2        get processorTokenCreate
        const accountId2 = accounts?.[0]?.account_id;
        
        if (!accountId2) {
            throw new Error("No valid account ID found");
        }
        
        const request2 = { 
            access_token: accessToken,
            account_id: accountId2,
            processor: ProcessorTokenCreateRequestProcessorEnum.ZeroHash
        };
      
        const response2 = await plaidClient.processorTokenCreate(request2);
        const processorToken = response2.data.processor_token;
        // Send this token to your payment processor

        console.log( processorToken );
      } catch (error: any) {
         console.log(error);
      }




})



/*


{
    "identities": [
        {
            "addresses": [
                {
                    "data": {
                        "city": "Malakoff",
                        "country": "US",
                        "postal_code": "14236",
                        "region": "NY",
                        "street": "2992 Cameron Road"
                    },
                    "primary": true
                },
                {
                    "data": {
                        "city": "San Matias",
                        "country": "US",
                        "postal_code": "93405-2255",
                        "region": "CA",
                        "street": "2493 Leisure Lane"
                    },
                    "primary": false
                }
            ],
            "emails": [
                {
                    "data": "accountholder0@example.com",
                    "primary": true,
                    "type": "primary"
                },
                {
                    "data": "accountholder1@example.com",
                    "primary": false,
                    "type": "secondary"
                },
                {
                    "data": "extraordinarily.long.email.username.123456@reallylonghostname.com",
                    "primary": false,
                    "type": "other"
                }
            ],
            "names": [
                "Alberta Bobbeth Charleson"
            ],
            "phone_numbers": [
                {
                    "data": "1112223333",
                    "primary": false,
                    "type": "home"
                },
                {
                    "data": "1112224444",
                    "primary": false,
                    "type": "work"
                },
                {
                    "data": "1112225555",
                    "primary": false,
                    "type": "mobile"
                }
            ]
        },
        {
            "addresses": [
                {
                    "data": {
                        "city": "Malakoff",
                        "country": "US",
                        "postal_code": "14236",
                        "region": "NY",
                        "street": "2992 Cameron Road"
                    },
                    "primary": true
                },
                {
                    "data": {
                        "city": "San Matias",
                        "country": "US",
                        "postal_code": "93405-2255",
                        "region": "CA",
                        "street": "2493 Leisure Lane"
                    },
                    "primary": false
                }
            ],
            "emails": [
                {
                    "data": "accountholder0@example.com",
                    "primary": true,
                    "type": "primary"
                },
                {
                    "data": "accountholder1@example.com",
                    "primary": false,
                    "type": "secondary"
                },
                {
                    "data": "extraordinarily.long.email.username.123456@reallylonghostname.com",
                    "primary": false,
                    "type": "other"
                }
            ],
            "names": [
                "Alberta Bobbeth Charleson"
            ],
            "phone_numbers": [
                {
                    "data": "1112223333",
                    "primary": false,
                    "type": "home"
                },
                {
                    "data": "1112224444",
                    "primary": false,
                    "type": "work"
                },
                {
                    "data": "1112225555",
                    "primary": false,
                    "type": "mobile"
                }
            ]
        }
    ],
    "balances": [
        {
            "account_id": "JvgqgzAMNWcX9Kwv58bqiq5xRlJKoqhBXe9kZ",
            "balances": {
                "available": 100,
                "current": 110,
                "iso_currency_code": "USD",
                "limit": null,
                "unofficial_currency_code": null
            },
            "mask": "0000",
            "name": "Plaid Checking",
            "official_name": "Plaid Gold Standard 0% Interest Checking",
            "subtype": "checking",
            "type": "depository"
        },
        {
            "account_id": "k3Z6ZaL7QoIzqP451GngUL9xkDaRKLCL71Xoq",
            "balances": {
                "available": 200,
                "current": 210,
                "iso_currency_code": "USD",
                "limit": null,
                "unofficial_currency_code": null
            },
            "mask": "1111",
            "name": "Plaid Saving",
            "official_name": "Plaid Silver Standard 0.1% Interest Saving",
            "subtype": "savings",
            "type": "depository"
        }
    ]
}


*/



//http://localhost:3000/create_transaction_1
router.get("/create_transaction_1", async (req: any, res: any) => {

    //Step 1: Check User's Bank Account Balance
    console.log("here ..............");
    const balanceResponse = await plaidClient.accountsBalanceGet({access_token: accessToken });
    res.json(balanceResponse.data.accounts);

});

//http://localhost:3000/create_transaction_2
router.get("/create_transaction_2", async (req: Request, res: Response) => {

    //Step 2: Check User's Linked Bank & Transfer Support


    // Step 2: Get user's linked bank accounts
    const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken });
    const userAccount = accountsResponse.data.accounts[0]; // Assume first account
    console.log("Linked Bank Account:", userAccount);

    res.json({"error": "No linked accounts found"});
    // Step 2.1: Search for the bank by name

    if (!userAccount) {
        throw new Error("No accounts found");
    }
    const bankName = userAccount.name; // Bank name (e.g., "Chase Bank")

    const institutionsResponse = await plaidClient.institutionsSearch({
        query: bankName,
        products: [Products.Transfer], // Check for transfer support
        country_codes: [CountryCode.Us],
    });


    if (institutionsResponse.data.institutions.length === 0) {
        console.log("Bank does not support transfers via Plaid.");
    } else {
        console.log(
            `Bank ${bankName} supports Transfers! Institution ID:`,
            institutionsResponse.data.institutions[0]
        );
    }


});

router.get("/create_transaction_3", async (req: any, res: any) => {

});

router.get("/create_transaction_4", async (req: any, res: any) => {

});

router.get("/create_transaction_5", async (req: any, res: any) => {

});







export default router;





