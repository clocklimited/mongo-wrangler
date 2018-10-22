# Mongo Rangler

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

