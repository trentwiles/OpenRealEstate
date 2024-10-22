# OpenRealEstate

## To Do

- Assign more resources to MongoDB

## API Docs

| Paths        | Link                      |
| ------------ | ------------------------- |
| GET /        | [Documentation](#/)       |
| POST /search | [Documentation](#/search) |
| GET /id      | [Documentation](#/id)     |

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

| Parameter        | Description                                                                     | Optional? | Example |
| ---------------- | ------------------------------------------------------------------------------- | --------- | ------- |
| town             | Town a property is located in                                                   |           |         |
| zip              | Zip code of a property                                                          |           |         |
| state            | US State abreviation of a property                                              |           |         |
| time             | Epoch time when property was scraped (range)                                    |           |         |
| marketPriceRange | Price of a property in USD (range)                                              |           |         |
| landUse          | Description of how property is used (ie. home, vacant) (case unsensative match) |           |         |
| taxes            | Epoch time when property was scraped                                            |           |         |
| landSize         | Epoch time when property was scraped                                            |           |         |
| yearBuilt        | Epoch time when property was scraped                                            |           |         |
| owner            | Epoch time when property was scraped                                            |           |         |
