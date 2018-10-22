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

*Note: This is a clock.co.uk specific workflow!*

## Dumping 💩

1. First ssh into database server

2. If this is your first dump 💩

    git clone git@github.com:clocklimited/mongo-wrangler.git

3. `cd mongo-wrangler`

4. `./dump.js {database name}`

5. Check the output for instructions and copy and paste the onliner

6. Send to the requester

## Request / Restorer

1. If this is your first restore

    git remote add origin git@github.com:clocklimited/mongo-wrangler.git

2. `cd mongo-wrangler`

3. Paste oneliner sent to you

4. 🎉

## Excluded Collections

[These collections](dump.js#L5) are excluded by default. If you need them please ask the privileged user to include them by editing the dump script.

If you find other big collections that are slowing up your dumps or taking a lot of space please send a PR or edit `dump.js` on a per project bases.

## Obfuscation

Properties containing [these properties](obfuscate.js#L1) are obfuscated by default. This can cause some data you don't want getting obfuscated. You'll have to ask the privileged to do a customer dump or submit a PR if this causes a problem.

## Troubleshooting

### You need to be on node 0.11+

You should be able to do to get a newer runtime:

`nave use stable`

### Xfer

This solution relies on [xfer.clock.co.uk](https://xfer.clock.co.uk)
