# googler-js
This npm add, edit, delete or display your events in Google Calendar on terminal.

## Install
```bash
npm install googler-js
```

## Setup
### 1. Enable Google Calendar API on GCP.
Login GCP > [APIs & Services] > [Enabled APIs & services]

https://cloud.google.com/endpoints/docs/openapi/enable-api

### 2. Configure OAuth consent screen.
[APIs & Services] > [OAuth consent screen]

https://support.google.com/workspacemigrate/answer/9222992?hl=ja

### 3. Create Service account.
[APIs & Services] > [Credentials] > [CREATE CREDENTIALS] > [Service account]

And then download credential json file.

https://cloud.google.com/docs/authentication/production?hl=ja#create_service_account

### 4. Share your Google Calendar to service account.
Select calendar you want to share to the service account, add people in [Share with specific people].

And then enter the email address of service account and select permissions (choice [Make changes to events]).

### 5. Set environment variables.
Copy env file.
```bash
cp .env.sample .env
```

Set environmental variables.
```bash:.env
export CREDENTIAL_KEY_FILE='~/service_credentials.json' # your credential file path
export CALENDAR_ID='xxxxx' # your calendar id
export TIMEZONE='Asia/Tokyo' # your timezone
```

Execute source command.
```bash
source .env
```

## Usage
Execute `googler-js` command with the below option.
```bash
$ googler-js -h
Usage: cli [options]

Options:
  -l, --list    list your calendar
  -a, --add     add a new schedule
  -d, --delete  delete a schedule
  -e, --edit    edit a schedule
  -h, --help    display help for command
```


