---
created: "2024-10-01T02:13:02Z"
updated: "2024-10-01T02:13:02Z"
title: "Migrate and Upgrade GitLab"
tags: ["git", "gitlab"]
series: "git"
description: "How to move GitLab from one server to another."
---

Last week while I was innocently trying to run `apt dist-upgrade` on my self-hosted GitLab box, I managed to mess up the kernel in a way that I couldn't recover. The box was hosted with DigitalOcean, but I was thinking of moving it over to Google Cloud anyway, so now I had no excuse.

After much searching and trying different things, here is the post I wish I had found.

## Recovery Console

First, I had to use DigitalOcean's Recovery Console to get access to the system. They give you temporary credentials to the box which you can use to SSH in. Remember you need to remove the host from `~/.ssh/known_hosts` because the recovery console will have a different SSH host key than your normal box.

```bash
ssh-keygen -f "~/.ssh/known_hosts" -R "gitlab.example.com"
ssh gitlab.example.com
```

The existing disk will be mounted at `/dev/vda1`. I recommend making symlinks to make it easier to navigate the disk:

```bash
cd /etc
ln -s /dev/vda1/etc/ssh
ln -s /dev/vda1/etc/gitlab

cd /var/opt
ln -s /dev/vda1/var/opt/gitlab
```

## Install GitLab

Let's setup a new GitLab instance. At first, I created a `2 vCPU + 2 GB RAM` box, based on the [system requirements](https://docs.gitlab.com/ee/install/requirements.html). Turns out that wasn't enough so I bumped it up to `4 vCPU + 4 GB RAM`. When _that_ wasn't enough, I ended up with `4 vCPU + 8 GB RAM`. This is one of the reasons I'm looking into migrating to [Gitea](https://about.gitea.com/).

To restore GitLab from a backup, you need to have an instance of GitLab running with the **exact same version number** (down to the last decimal). This turns out to be more difficult than you might expect.

The last backup I had was running 16.11.8, but if you try installing that version using the [Ubuntu install instructions](https://about.gitlab.com/install/#ubuntu), you'll see that that package is no longer supported. So you need to find the correct version on https://packages.gitlab.com/gitlab/gitlab-ee/ and manually install it:

```bash
apt-get update
apt-get install -y htop curl openssh-server ca-certificates tzdata perl
wget --content-disposition https://packages.gitlab.com/gitlab/gitlab-ee/packages/ubuntu/jammy/gitlab-ee_16.11.8-ee.0_amd64.deb/download.deb
EXTERNAL_URL="https://gitlab.metaist.com" dpkg -i gitlab-ee_16.11.8-ee.0_amd64.deb
```

## Migrate & Restore

Once that server is up and running we can follow the instructions for [GitLab migration](https://docs.gitlab.com/ee/administration/backup_restore/migrate_to_new_server.html) and the [GitLab restoration](https://docs.gitlab.com/ee/administration/backup_restore/restore_gitlab.html).

First, stop the current server and backup the redis dump.

```bash
gitlab-ctl stop
cp /var/opt/gitlab/redis/dump.rdb /var/opt/gitlab/redis/dump.rdb.backup
chown root /var/opt/gitlab/redis /var/opt/gitlab/backups
```

Copy these files from the old server to the new server:

- `/var/opt/gitlab/backup/xxxxxxxxx_yyyy_mm_dd_16.11.8-ee_gitlab_backup.tar` (the most recent backup)
- `/var/opt/gitlab/git-data/repositories/` (all the repository data)
- `/var/opt/gitlab/gitlab-rails/uploads/` (all the uploaded avatars, etc.)
- `/var/opt/gitlab/redis/dump.rdb`
- `/etc/ssh/*_key` (the server SSH keys)
- `/etc/gitlab/gitlab-secrets.json`
- `/etc/gitlab/ssl/*`
- `/etc/gitlab/trusted-certs/*`
- `/etc/gitlab/gitlab.rb`

On the new server, edit `/etc/gitlab/gitlab.rb` and add:

```ruby
nginx['custom_gitlab_server_config'] = "location = /api/v4/jobs/request {\n deny all;\n return 503;\n }\n"
```

Fix the permissions and restart the server:

```bash
chown gitlab-redis /var/opt/gitlab/redis
chown gitlab-redis:gitlab-redis /var/opt/gitlab/redis/dump.rdb
chown git:root /var/opt/gitlab/backups
chown git:git /var/opt/gitlab/backups/*.tar
chown -R git:git /var/opt/gitlab/git-data/repositories

gitlab-ctl reconfigure
gitlab-ctl start
gitlab-ctl stop puma
gitlab-ctl stop sidekiq
gitlab-ctl status # verify
```

Restore from backup (this will delete and re-create the database) and restart:

```bash
gitlab-backup restore BACKUP=xxxxxxxxx_yyyy_mm_dd_16.11.8-ee
gitlab-ctl restart
```

[Connect to the database](https://docs.gitlab.com/omnibus/settings/database.html#connecting-to-the-postgresql-database) and refresh table stats:

```bash
gitlab-rails dbconsole --database main
```

```sql
SET STATEMENT_TIMEOUT=0 ; ANALYZE VERBOSE;
```

Run checks:

```bash
gitlab-rake gitlab:check SANITIZE=true
gitlab-rake gitlab:doctor:secrets
gitlab-rake gitlab:artifacts:check
gitlab-rake gitlab:lfs:check
gitlab-rake gitlab:uploads:check VERBOSE=true
```

Edit `/etc/gitlab/gitlab.rb`, remove:

```ruby
nginx['custom_gitlab_server_config'] = "location = /api/v4/jobs/request {\n deny all;\n return 503;\n }\n"
```

```bash
gitlab-ctl reconfigure
```

## Upgrade

Hopefully, you now have a running GitLab instance and we can try to [upgrade GitLab](https://docs.gitlab.com/ee/update/#upgrading-to-a-new-major-version). One thing I didn't quite appreciate is that to get to the next major version, you need to install every minor version along the "upgrade path".

For example, because the server was at 16.11.8, I first had to install the latest 16.11 version (16.11.10). Then the latest 17.3 (17.3.3). And only **then** could I upgrade to the latest 17.4 (17.4.1).

Luckily, by now I knew where to get old versions of GitLab:

```bash
wget --content-disposition https://packages.gitlab.com/gitlab/gitlab-ee/packages/ubuntu/jammy/gitlab-ee_16.11.10-ee.0_amd64.deb/download.deb
EXTERNAL_URL="https://gitlab.example.com" dpkg -i gitlab-ee_16.11.10-ee.0_amd64.deb

# What's the latest 17.3?
apt-cache madison gitlab-ee # => 17.3.3-ee.0
apt-get install gitlab-ee=17.3.3-ee.0

# now we can update normally
apt upgrade -y gitlab-ee
```
