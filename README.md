# ktab Manager
## A tab management system for chrome
### Application structure

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
