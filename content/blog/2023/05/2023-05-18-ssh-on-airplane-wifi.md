---
created: "2023-05-18T09:41:41Z"
updated: "2023-05-18T09:41:41Z"
title: "SSH on Airplane WiFi"
tags: ["trace"]
description: "In which I try, unsuccessfully, to run ssh over an airplane wifi."
---

**Contents**
[[toc]]

## Goal

To release [`ezq 3.0.0`](/blog/2023/05/ezq-3.0.0.html) while I'm traveling on a plane.

## `git push` hangs

The first problem I notice is that `git push` hangs:

```bash
$ git push
# hangs

$ git push -vvv
Pushing to github.com:metaist/ezq.git
# hangs
```

## `ssh -T` hangs

Let's do some simple sanity checking:

```bash
$ ssh -T git@github.com
# hangs

$ ssh -T git@github.com -vvvv
OpenSSH_9.0p1, LibreSSL 3.3.6
debug1: Reading configuration data ~/.ssh/config
debug1: ~/.ssh/config line 13: Applying options for github.com
debug1: Reading configuration data /etc/ssh/ssh_config
debug1: /etc/ssh/ssh_config line 21: include /etc/ssh/ssh_config.d/* matched no files
debug1: /etc/ssh/ssh_config line 54: Applying options for *
debug3: expanded UserKnownHostsFile '~/.ssh/known_hosts' -> '~/.ssh/known_hosts'
debug3: expanded UserKnownHostsFile '~/.ssh/known_hosts2' -> '~/.ssh/known_hosts2'
debug1: Authenticator provider $SSH_SK_PROVIDER did not resolve; disabling
debug1: Connecting to github.com port 22.
debug1: Connection established.
debug1: identity file ~/.ssh/keys/github.com/id_rsa type 0
debug1: identity file ~/.ssh/keys/github.com/id_rsa-cert type -1
debug1: Local version string SSH-2.0-OpenSSH_9.0
debug1: Remote protocol version 2.0, remote software version babeld-fc59fe75
debug1: compat_banner: no match: babeld-fc59fe75
debug3: fd 5 is O_NONBLOCK
debug1: Authenticating to github.com:22 as 'git'
debug3: record_hostkey: found key type ED25519 in file ~/.ssh/known_hosts:64
debug3: record_hostkey: found key type ECDSA in file ~/.ssh/known_hosts:65
debug3: record_hostkey: found key type RSA in file ~/.ssh/known_hosts:67
debug3: load_hostkeys_file: loaded 3 keys from github.com
debug1: load_hostkeys: fopen ~/.ssh/known_hosts2: No such file or directory
debug1: load_hostkeys: fopen /etc/ssh/ssh_known_hosts: No such file or directory
debug1: load_hostkeys: fopen /etc/ssh/ssh_known_hosts2: No such file or directory
debug3: order_hostkeyalgs: have matching best-preference key type ssh-ed25519-cert-v01@openssh.com, using HostkeyAlgorithms verbatim
debug3: send packet: type 20
debug1: SSH2_MSG_KEXINIT sent
# hangs
Connection reset by 140.82.114.3 port 22
```

## Maybe `port 22` is blocked?

[Some nice advice here suggests we could try using `port 443`](https://stackoverflow.com/questions/7953806/github-ssh-via-public-wifi-port-22-blocked).

```bash
# .ssh/config
Host github.com
    Hostname ssh.github.com
    Port 443
```

## Plane Landed

Alas this doesn't work either and it's already time to land. I may try again on the return flight.

## Trying `port 443` again

After confirming that `ssh.github.com:443` worked correctly on a normal connection, it still doesn't work on the airplane wifi.

```bash
% ssh -vvvv -T git@github.com
OpenSSH_9.0p1, LibreSSL 3.3.6
debug1: Reading configuration data ~/.ssh/config
debug1: ~/.ssh/config line 18: Applying options for github.com
debug1: Reading configuration data /etc/ssh/ssh_config
debug1: /etc/ssh/ssh_config line 21: include /etc/ssh/ssh_config.d/* matched no files
debug1: /etc/ssh/ssh_config line 54: Applying options for *
debug3: expanded UserKnownHostsFile '~/.ssh/known_hosts' -> '~/.ssh/known_hosts'
debug3: expanded UserKnownHostsFile '~/.ssh/known_hosts2' -> '~/.ssh/known_hosts2'
debug1: Authenticator provider $SSH_SK_PROVIDER did not resolve; disabling
debug1: Connecting to ssh.github.com port 443.
debug1: Connection established.
debug1: identity file ~/.ssh/keys/github.com/id_rsa type 0
debug1: identity file ~/.ssh/keys/github.com/id_rsa-cert type -1
debug1: Local version string SSH-2.0-OpenSSH_9.0
debug1: Remote protocol version 2.0, remote software version babeld-fc59fe75
debug1: compat_banner: no match: babeld-fc59fe75
debug3: fd 5 is O_NONBLOCK
debug1: Authenticating to ssh.github.com:443 as 'git'
debug3: put_host_port: [ssh.github.com]:443
debug3: record_hostkey: found key type ED25519 in file ~/.ssh/known_hosts:68
debug3: load_hostkeys_file: loaded 1 keys from [ssh.github.com]:443
debug1: load_hostkeys: fopen ~/.ssh/known_hosts2: No such file or directory
debug1: load_hostkeys: fopen /etc/ssh/ssh_known_hosts: No such file or directory
debug1: load_hostkeys: fopen /etc/ssh/ssh_known_hosts2: No such file or directory
debug3: order_hostkeyalgs: have matching best-preference key type ssh-ed25519-cert-v01@openssh.com, using HostkeyAlgorithms verbatim
debug3: send packet: type 20
debug1: SSH2_MSG_KEXINIT sent
```

And then it hangs. Maybe I'll [revisit the proxy idea](https://gist.github.com/guillochon/eeaa54b328952d260472c14c559f698a) sometime.
