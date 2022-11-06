# ktab Manager
## A tab management system for chrome
### Application structure

Project URL: ktab manager

Organize notes, todos, reminders, tabs, links, videos, images and more using the KTab manager webapp. Its fast, responsive, snappy and is beautiful. Use the public Guest dashboard to keep items in a publically available board or create your own account or login with your Google account to use your private boards. Boards are called Organizations. Each Organization has multiple Collections and Collections contain several Items that is the basic unit of data. The app uses Firestore database to store all the data of each user in its NoSQL database. Other packages and technologies used in KTab manager are;
- Mantine UI
- Firebase Auth
- Firestore
- DnD kit
- CRA React

User A (User based access)
- Organization A
- - Collection AA
- - Collection AB
- - --- Item 1 : link
- - --- Item 2 : note
- - --- Item 3 : reminder
- Organization B
- - Collection BA
- - Collection BB

### Database structure

User A (ID)
- Organizations
- - Organization A (parent: user)
- - Organization B
- Collections
- - Collection AA (parent: organization)
- - Collection AB
- - Collection BA
- - Collection BB
- Items
- - Item 1 (parent: collection)
- - Item 2
- - Item 3

### TODO

- Create a context and keep states in the context ✔
- CURD from organization tabs
- CURD form collections box
- Other types of items
- Refresh
- Sync with server
- Set background
- Edit profile
- Add functional entries to the spotlight
- Maybe cache orgs, collections, items to localStorage for faster init 


Organization Firestore collection
  Each entry is a new organization
  Each organization has:
  ```
  "Container": [
    "A1", //array  of objects
    "A3"
  ],
  "Container": [
    "B3"
  ]
  ```
  Each item within the container is an object:
  ```
  {
    id: UniqueIdentifier,
    name: "Name of the item",
    type: link|todo|note|reminder|countdown|calender
    link: "http://link.com",
    content: "String content/RTE content",
    color: Color Code,
    tags: important|password|etc
    created_on: timestamp,
    is_deleted: boolean //Shows up in trash
  }
  ```
  name, content, link is used in Search.
  Hierarchy is like:
  ```
  {
    Organization: {
      "Container": [
          "A1",
          "A3"
      ],
      "Container": [
          "B3"
      ]
    },
    Organization: {
      "Container": [
          "A3"
      ]
    }
  }
  ```
  TODO:
  * Notifications in header
  * Firestore sync
  * Trash drag
  * Login using socials
  * Settings
  * Search
  * Theme color swachtes
  * Checklists