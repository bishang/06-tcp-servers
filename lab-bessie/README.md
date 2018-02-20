# Bessie's TCP Chat

To connect to my server, enter the following command in your terminal:

```sh
telnet 172.16.9.85 3000
```
Available commands:

`@all <message>` Sends a message to everyone connected.

`@nickname <new-nickname>` Allows you to change your nickname.

`@dm <target-user> <message>` Sends a direct message to a specific user.

`@list` Will list all current users.

`@quit` Will end your current session.

`@help` Will show you a list of available commands.