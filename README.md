# sophomore.stuysu.org

The sophomore student union website. See [our frontend prototype](https://github.com/pserb/sophsu-web).

## Available scripts

`npm run start`
`npm run test`

## Environment Variables

It's easiest to make a `.env` file to use these locally.

| Name | Description |
|:----:|:-----------:|
| **PORT** | what port to run on (default is 3001) |
| **DATABASE_LOAD** | describes how to load the Sequelize ORM (force, alter) |
| **DATABASE_URL** | a database url to use (default is a SQLite DB at ./app.db) |
| **LOG** | if the database should log (default is no logging) |
| **AUTH_ADMIN**| if the admin panel should ask for verification in development (default is no verification development) |
| **ADMIN_ROUTE** | the route that the admin panel should be on (e.g. new-name --> /admin/new-name, default is /admin) |
| **CLIENT_ID** | the google api client id for the google admin panel authorization (not necessary if NO_AUTH is on) |
| **NO_AUTH** | determines if the google api should be used when authenticating |

## Todo

* add session to admin page
* think about better study guide and event interface for admin page
* add newsletter
* timezones are messed up between local and remote website (e.g. event interface)
* redesign error page
* make sure that in development, the app can be run without google api
