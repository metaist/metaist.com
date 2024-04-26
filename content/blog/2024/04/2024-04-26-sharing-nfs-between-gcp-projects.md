---
created: "2024-04-26T19:28:03Z"
updated: "2024-04-26T19:28:03Z"
title: "Sharing NFS Between GCP Projects"
tags: ["nfs", "gcp"]
---

One of the parts of Google Cloud that I haven't fully explored yet is their networking stack. However, I got a nice first taste yesterday while trying to share a Google Filestore (NFS) between two Google Cloud projects.

Now that I've figured it out, here's the simplest solution:

- In the project that has the NFS (the "host" project), go to:
  - `VPC network`
  - `Shared VPC`
  - `Attached Projects`
  - `Attach Projects`
- Select the other project (the "service" project).
  - Check `All subnets`.
  - Click `Save`.
- In the service project, create a new VM:
  - `Compute Engine`
  - `VM instances`
  - Click `Create Instance`.
  - Make sure you select a region that is the same or close to the NFS.
  - Expand `Advanced Options`
  - Expand `Networking`
  - Expand the `default` network interface.
    - Select `Networks shared with me` and select `default` (assuming that was the network that was shared).

Now that VM can see the NFS because its on the same subnet.
