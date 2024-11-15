# OpenRealEstate

## To Do

- Assign more resources to MongoDB

## API Docs

| Paths         | Link                        |
| ------------- | --------------------------- |
| GET /         | [Documentation](#/)         |
| POST /search  | [Documentation](#/search)   |
| GET /property | [Documentation](#/property) |
| GET /random   | [Documentation](#/random)   |

### /

Description: returns basic stats about the server's health
Parameters: none
Example:

```
GET /

{
  "mongo": {
    "serverTime": "2024-10-22T22:12:10.045Z",
    "mongoVersion": "8.0.1",
    "uptimeSeconds": 193652
  },
  "express": {
    "expressVersion": "4.21.1"
  }
}
```

### /search

Description: searches the real estate database for a search term(s)
Parameters:

| Parameter        | Description                                                                         | Example                   |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| town             | Town a property is located in                                                       | `"Oakland"`               |
| zip              | Zip code of a property                                                              | `94015`                   |
| state            | US State abreviation of a property                                                  | `MN`                      |
| time             | Epoch time when property was scraped (range)                                        | `"1729440645-1729640645"` |
| marketPriceRange | Price of a property in USD (range)                                                  | `"100000-200000"`         |
| landUse          | Description of how property is used (ie. home, vacant) (case unsensative match)     | `"Vacant"`                |
| taxes            | Property tax paid by owner in last available year (range)                           | `"1000-5000"`             |
| landSize         | Land size in square meters (range)                                                  | `"100-1000"`              |
| yearBuilt        | What year construction of the property was completed                                | `"2015"`                  |
| owner            | Name of the owner, could be a gov't, person, company, etc. (case unsensative match) | `"Johnson"`               |
| limit            | Maximum number of results to return, 10 by default                                  | `8`                       |

_Note: a request must contain at least one of the parameters above. A 400 error will be returned otherwise._

```
POST /search
{"state": "MA", "yearBuilt": "1990", "limit": 4}


{
  "results": [
    {
      "_id": "6716b9e056ac4729f23345af",
      "owner": [
        {
          "fullName": "DOSSANTOS, DAIN",
          "firstName": "DAIN",
          "middleName": null,
          "lastName": "DOSSANTOS"
        },
        {
          "fullName": "DOSSANTOS, LISA",
          "firstName": "LISA",
          "middleName": null,
          "lastName": "DOSSANTOS"
        }
      ],
      "yearBuilt": "1990",
      "landSize": 9847.955390334573,
      "streetAddressDetails": {
        "town": "Attleboro",
        "state": "MA",
        "zip": "02703"
      },
      "streetAddress": "474 Pike Ave, Attleboro, MA 02703",
      "marketValue": null,
      "taxYear": "2024",
      "taxes": 6940,
      "landUse": "1-FAMILY RESIDENCE",
      "verboseTransaction": {
        "lastMarketSale": {
          "pricePerArea": 19.144981412639407,
          "value": 385000,
          "seller": "GINGRAS, PAMELA J",
          "buyer": "DOSSANTOS, LISA; DOSSANTOS, DAIN",
          "filingDate": "2007-08-13T00:00:00.000Z",
          "transferDate": "2007-08-13T00:00:00.000Z",
          "documentNumber": "39966",
          "documentTypeCode": "DE",
          "documentTypeDescription": "DEED",
          "lender": "BANKBOSTON",
          "loan": {
            "code": null,
            "description": null,
            "first": 365750,
            "second": 0
          },
          "sale": {
            "code": "D",
            "description": "FULL AMOUNT STATED ON DOCUMENT"
          },
          "titleCompany": null,
          "tdDocumentNumber": null,
          "deedTransactionType": "2",
          "lenderType": null
        },
        "priorMarketSale": {
          "transferDate": null,
          "lender": "BANKBOSTON"
        },
        "multipleApnFlag": null
      },
      "assessmentVerbose": {
        "alternateApn": null,
        "apn": "ATTL M:123 L:26C",
        "assessedValue": {
          "total": 545200,
          "land": 166000,
          "improvements": 379200,
          "year": "2024"
        },
        "marketValue": {
          "total": null,
          "land": null,
          "improvements": null,
          "year": null
        },
        "improvementPercent": 69.55,
        "lot": {
          "lotNumber": "26C",
          "blockNumber": null,
          "depth": 0,
          "width": 0,
          "size": 9510.121000000001
        },
        "poolIndicator": null,
        "zoning": {
          "assessment": "R1"
        },
        "book": null,
        "page": null,
        "avm": "688333"
      },
      "geoPolygon": {
        "wkt": "POLYGON ((-71.2502803204144 41.9387706595702, -71.2478263941595 41.9395136159165, -71.2480242965772 41.9397092783677, -71.2483321435762 41.9399544107506, -71.2498771316927 41.9392475253938, -71.2505014410661 41.9390555942292, -71.2503770534419 41.9389114135517, -71.2502803204144 41.9387706595702))"
      },
      "lightboxParcelID": "0203O49SWWT5PWTQUMWXDD",
      "id": "dbf7d616-7afa-4917-afc4-82bd639614cf",
      "scrapedAt": 1729542625
    },
    ...
  ]
}
```

### /property

Description: search a property by internal ID
Parameters:
| Parameter | Description | Example |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| id | Internal UUID | `"cafa94cc-0ce3-4a24-8473-307e45acd925"` |

Example:

```
GET /property?id=12586302-d60c-4fc9-a940-8e9526fa63e7

{
  "results": [
    {
      "_id": "671661fe28c055cb0533443b",
      "owner": [
        {
          "fullName": "SCHMUCKER, JANNAKEN H",
          "firstName": "JANNAKEN",
          "middleName": "H",
          "lastName": "SCHMUCKER"
        }
      ],
      "yearBuilt": "1984",
      "landSize": 2223.791821561338,
      "streetAddressDetails": {
        "town": "Harmony",
        "state": "NC",
        "zip": "28634"
      },
      "streetAddress": "214 Skyview Lake Rd, Harmony, NC 28634",
      "marketValue": 39480,
      "taxYear": "2023",
      "taxes": 293,
      "landUse": "MOBILE HOME (SINGLE WIDE)",
      "verboseTransaction": {
        "lastMarketSale": {
          "pricePerArea": 1.20817843866171,
          "value": 23500,
          "seller": "U S BANK NATIONAL ASSOCIATION, ; THE CIM TRUST 2019 R2,",
          "buyer": "SCHMUCKER, JANNAKEN H",
          "filingDate": "2021-10-15T00:00:00.000Z",
          "transferDate": "2021-10-15T00:00:00.000Z",
          "documentNumber": null,
          "documentTypeCode": "SW",
          "documentTypeDescription": "SPECIAL WARRANTY DEED",
          "lender": null,
          "loan": {
            "code": null,
            "description": null,
            "first": 0,
            "second": 0
          },
          "sale": {
            "code": "2",
            "description": "FULL AMOUNT STATED ON DOCUMENT."
          },
          "titleCompany": "NONE AVAILABLE",
          "tdDocumentNumber": null,
          "deedTransactionType": "2",
          "lenderType": null
        },
        "priorMarketSale": {
          "transferDate": null,
          "lender": ""
        },
        "multipleApnFlag": "2"
      },
      "assessmentVerbose": {
        "alternateApn": null,
        "apn": "4880-72-0120.000",
        "assessedValue": {
          "total": 39480,
          "land": 16500,
          "improvements": 22980,
          "year": "2023"
        },
        "marketValue": {
          "total": 39480,
          "land": 16500,
          "improvements": 22980,
          "year": "2023"
        },
        "improvementPercent": 58.2,
        "lot": {
          "lotNumber": null,
          "blockNumber": "72",
          "depth": 0,
          "width": 30.48,
          "size": 2266.2416000000003
        },
        "poolIndicator": null,
        "zoning": {
          "assessment": "RA"
        },
        "book": null,
        "page": null,
        "avm": "179000"
      },
      "geoPolygon": {
        "wkt": "POLYGON ((-80.7330227014574 35.9413053730385, -80.7326738815006 35.9413463479847, -80.7331354423624 35.9419379811794, -80.7334762696038 35.9419095266428, -80.7330227014574 35.9413053730385))"
      },
      "lightboxParcelID": "0205JTGBMUL64JFU55G8BO",
      "id": "12586302-d60c-4fc9-a940-8e9526fa63e7",
      "scrapedAt": 1729520126
    }
  ]
}
```

### /random

Description: get a random property

Parameters:
| Parameter | Description | Example |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| limit | Number of results to return (maximum of 10) | `5` |

```
GET /random?limit=3

{
  "results": [
    {
      "_id": "67169a8eb427f84b2e33446d",
      "owner": [
        {
          "fullName": "PALMER, DEBORAH A",
          "firstName": "DEBORAH",
          "middleName": "A",
          "lastName": "PALMER"
        }
      ],
      "yearBuilt": "2021",
      "landSize": 33231.87732342008,
      "streetAddressDetails": {
        "town": "Robbins",
        "state": "TN",
        "zip": "37852"
      },
      "streetAddress": "1632 Chambers Rd, Robbins, TN 37852",
      "marketValue": 181300,
      "taxYear": null,
      "taxes": null,
      "landUse": "RESIDENTIAL IMPROVED SITE + MOBILE HOME",
      "verboseTransaction": {
        "lastMarketSale": {
          "pricePerArea": 9.200743494423792,
          "value": 199845,
          "seller": "CMH HOMES INC,",
          "buyer": "PALMER, DEBORAH A",
          "filingDate": "2022-02-01T00:00:00.000Z",
          "transferDate": "2022-02-01T00:00:00.000Z",
          "documentNumber": "22000245",
          "documentTypeCode": "SW",
          "documentTypeDescription": "SPECIAL WARRANTY DEED",
          "lender": null,
          "loan": {
            "code": "F",
            "description": "FHA",
            "first": 196224,
            "second": 0
          },
          "sale": {
            "code": "2",
            "description": "FULL AMOUNT STATED ON DOCUMENT."
          },
          "titleCompany": null,
          "tdDocumentNumber": "22000246",
          "deedTransactionType": "9",
          "lenderType": null
        },
        "priorMarketSale": {
          "transferDate": null,
          "lender": ""
        },
        "multipleApnFlag": null
      },
      "assessmentVerbose": {
        "alternateApn": null,
        "apn": "076103    04322",
        "assessedValue": {
          "total": 45325,
          "land": 10150,
          "improvements": 35175,
          "year": "2023"
        },
        "marketValue": {
          "total": 181300,
          "land": 40600,
          "improvements": 140700,
          "year": "2023"
        },
        "improvementPercent": 77.6,
        "lot": {
          "lotNumber": "12",
          "blockNumber": null,
          "depth": 0,
          "width": 0,
          "size": 35248.15060000001
        },
        "poolIndicator": null,
        "zoning": {
          "assessment": null
        },
        "book": null,
        "page": null,
        "avm": "200000"
      },
      "geoPolygon": {
        "wkt": "POLYGON ((-84.5540007859041 36.3751251330068, -84.5540455772402 36.3752716861829, -84.5541070292999 36.3754792505416, -84.5541297445721 36.3756758415856, -84.5541244564711 36.3758570603431, -84.5540923742572 36.3760667816543, -84.5580108691485 36.3763710362752, -84.5581178540739 36.3756314510571, -84.5540007859041 36.3751251330068))"
      },
      "lightboxParcelID": "0201UFJCWJLS9B5VXJE0DF",
      "id": "0746b099-dfc3-48e3-b3af-628f4704259f",
      "scrapedAt": 1729534606
    },
    ...
  ]
}
```

### /newExportJob

Description: add a new PDF export job to the queue. Returns the ID of the job once it has been created.

Parameters:
| Parameter | Description | Example |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| id | Property ID (found under frontend url /p/<id>) | `NjczMTY3YWQxOTc5OGU1MDM3MDY0NmMy` |

```
POST /newExportJob

{"id": "NjczMTY3YWQxOTc5OGU1MDM3MDY0NmMy"}

{
  "success": true,
  "jobID": "67376e3f58f0fef9582a473a"
}
```

### /getJobStatus/<id>

Get progress update on a PDF export job.

Parameters:
| Parameter | Description | Example |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| id | Job ID (returned from /newExportJob) | `6736da103c511a7b978650a9` |

```
GET /getJobStatus/6736da103c511a7b978650a9

# In-progress example:

{
  "isCompleted": false,
  "downloadLink": null
}

# Completed Example

{
  "isCompleted": true,
  "downloadLink": "http://localhost:3001/uploads/2024/11/15/3c50b6ee-d105-47af-b247-587eeb2b4a61.pdf"
}
```