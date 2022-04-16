---
template: blog
---

# Be careful with Heroku Postgres

This will be a short one. Just a quick _lil'_ rant.

Heroku is a great platform for starting out a project. You can get up and running quickly, and it's extremely easy to add in valuable services (via Heroku add-ons) as well as scaling up and down.

As a result, it's often a good pick for early-stage startups. A lot of the architecture woes are handled for you, so you can spend more time on your product, and still scale fast if you happen to hit the front page of HackerNews or something.

Now, at some point, if things start going very well, you might outgrow Heroku. There's a lot of reasons for this which I won't discuss here. Thus, you'll need to migrate your infrastructure somewhere else like, say, AWS.

For most services, this will be reasonably easy (as far as migrating infrastructure goes). However, if you happen to be using Heroku Postgres, good luck.

From their own ["Help" section](https://help.heroku.com/E10ZZ6IJ/why-can-t-i-use-third-party-tools-to-replicate-my-heroku-postgres-database-to-a-non-heroku-database):

> "Heroku Postgres does not give customers access to the superuser role, or allow customers to grant other users the replication role, due to these roles being very privileged".

So yeah, all these services out there to help you replicate a Postgres instance are out of bounds. Forget hooking Amazon DMS or Debezium to your database and letting it do the heavy lifting.

The one way to bulk export data is the built-in [Heroku PGBackups feature](https://devcenter.heroku.com/articles/heroku-postgres-backups), but that can be pretty slow for a large DB, meaning it will probably be extremely out of sync by the time you load the data into your new instance.

Ultimately, it's a hassle that can be overcome, but not without some annoyance and extra work on your end.

So Heroku, please, just let me be a superuser on my database.
