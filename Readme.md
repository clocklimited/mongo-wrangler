# Mongo Wrangler

Lightweight copies of databases with personal data obfuscated.

**Two developers one dump 💩**

To keep customer data safe and reduce the liability on developers, live database access is only granted to people who really need it for operational support. You really don't want to be in that group, you'll get called at all hours and be asked to help solve horrible problems for angry customers and bosses.

## How does this work?

**Developer:** 🤔 I need a copy of the production database to do my work

**Developer:** 💬 Hey privileged user can I have a copy of `acme-cms-production` database?

**Privileged user:** 💬 Sure, I'll send you a link.

**Privileged user:** 🙂 1. ssh to database server. 2. Run a oneliner. 3. Copy and paste oneliner for **Developer** to run.

**Privileged user:** 💬 Here you go! {ONELINER GOES HERE}

**Developer:** 💬 Thanks.

**Developer:** {ONELINER GOES HERE} `Running...` 😗🎶

**Developer:** 💬 Got it thanks! 😄

**Privileged user:** 💬 You are most welcome. 😄 Have a great day! 🎈

_Note: This is a clock.co.uk specific workflow!_

## Dependencies

This package requires `zstd` and `unzstd` binaries. You can get them from:

Debian-based Linux (Ubuntu, etc):
`apt install zstd`

OSX:
`brew install zstd`

## Dumping 💩

**NB: With this tool it is possible to exhaust available disk space on the MongoDB server. For now, it is essential to manually check the size of the database you are going to dump, and the available disk space. Furthermore, if possible avoid running the tool close to the beginning of a new hour; Clock's servers are snapshotted every hour on the hour, and it is best to avoid storing the temporary dump files in those backups.**

1. First ssh into database server

2. If this is your first dump 💩

`git clone https://github.com/clocklimited/mongo-wrangler.git`

`cd mongo-wrangler`

Then either:

If you have node installed -

`./dump.js {database name}`

If you want to exclude additional collections use `-e` `./dump.js -e member,subscriber,duck,log {database name}`

Or, using the binary - no node required:

```
./dump.sh database-name
```

5. Check the output for instructions and copy and paste the correct onliner

6. Send to the requester

## Request / Restorer

1. Paste oneliner sent to you.

2. 🎉

## Excluded Collections

[These collections](dump.js#L21-L27) are excluded by default. If you need them please ask the privileged user to include them by providing `-i collectionName` to the dump script, e.g. `./dump.js -i sessions {database name}`.

If you find other big collections that are slowing up your dumps or taking a lot of space please send a PR or edit `dump.js` on a per project bases.

## Obfuscation

Properties containing [these properties](obfuscate.js#L1) are obfuscated by default. This can cause some data you don't want getting obfuscated. You'll have to ask the privileged to do a customer dump or submit a PR if this causes a problem.

## Cross-platform

The latest version of mongo-wrangler supports two executables for Node-free dumping and restoration.

Linux and MacOS binaries are available in `dist/`. You simply need to clone the repo and use these as you would through Node. Some options are supported via environment variables.

Or, you can use the automatic cross-platform scripts at `dump.sh` or `restore.sh`.

## Troubleshooting

### You need to be on node 0.11+

If you are developing changes to mongo-wrangler, you should be able to do to get a newer runtime:

`nave use stable`

### No `node` no `nave`

```
wget http://github.com/isaacs/nave/raw/main/nave.sh
bash ./nave.sh use stable
```

### Verbose Mode

Add `-v` or `VERBOSE=1` on either command to see the commands run and get verbose output

### Mongo 2 Failing because of invalid indexes

Use `-n` or `NO_INDEX=1` to ignore indexes on restore

` ./restore.js -n {DB} {URL}`

### Xfer

This solution relies on [xfer.clock.co.uk](https://xfer.clock.co.uk)
