---
created: "2023-06-06T20:31:34Z"
updated: "2023-06-06T20:31:35Z"
title: "Trying whisperX"
tags: ["trace", "Shalev NessAiver"]
---

As part of making the [first episode]({{BLOG_URL}}/2023/06/design-lab-1.html) of [_Design Lab_]({{BLOG_URL}}/tag/design-lab/), I needed two assets: subtitles and a transcript.

## Problem

The entire episode was recorded with Google Meet (video + transcript), but the resulting Google Doc was not that great. YouTube's automatic captions weren't that great either.

## Possible Solution

**Shalev NessAiver** pointed me at [whisperX](https://github.com/m-bain/whisperX) which can do all kinds of transcription tasks. He had warned me that [**speaker diarization**](https://en.wikipedia.org/wiki/Speaker_diarisation) (figuring out who is speaking) was super slow. So I figured I could run the process over night to try it out.

## Setup

First, I had to [get a HuggingFace token](https://huggingface.co/settings/tokens) and [agree to a bunch of user agreements](https://github.com/m-bain/whisperX#speaker-diarization).

Then, I was able to get it running on my M1 pretty easily:

```bash
git clone https://github.com/m-bain/whisperX.git
cd whisperX
pip install torch torchvision torchaudio
pip install -e .
whisperx --help
```

I extracted the audio from the recording:

```bash
ffmpeg -i video.mp4 audio.mp3
```

## Running

Then I made a little wrapper around `whisperx` in a file called `run.sh`:

```bash
#!/usr/bin/env bash
time whisperx \
  --model large-v2 \
  --compute_type float32 \
  --language en \
  --diarize \
  --min_speakers 2 \
  --max_speakers 2 \
  --threads 10 \
  --hf_token <REMOVED> \
  $@
```

Then I ran `run.sh audio.mp3` which ran for many hours. I added the `time` command afterwards because I realized I didn't know how long it actually took. Certainly over 3 hours for an hour-long audio.

## Clean up

`whisperx` produces several formats:

- `.json`: very detailed word-level segment information including the speaker and a score
- `.srt`: a subtitle file. This is the main thing I cleaned up
- `.tsv`: start, end, and text in a tab-delimited format
- `.txt`: all the text without speaker or time information
- `.vtt`: similar to the `.srt`, but starts with `WEBVTT` (not sure how else its different)

There were only a few places where I needed to clean up the `.srt`. Transcription was really good and only picked the wrong word when I was mumbling or using technical jargon (e.g., `document.createElement`).

Diarization was remarkably good, but it turned out that `--max-speakers` was _technically false_ because there was a very short bit where my niece chimed in. It didn't mess things up too much. There were maybe a handful of places where the speaker was incorrectly selected or not indicated at all.

Overall, I was able to watch the video at `1.6x` and comfortably read the subtitles along and make edits which was great. I uploaded the new `.srt` file to YouTube and was glad when it accepted the result without complaint.

## Transcript

The last bit was to create a transcript from the `.srt` file. My initial idea was to merge adjacent subtitles if they had the same speaker. I published [`srt2txt.py`](https://gist.github.com/metaist/b10433ccc6795d4ed82ef42e0b70a209) as a small gist to try it out.

The walls of text are ugly, but it [made a reasonable transcript]({{BLOG_URL}}/2023/06/design-lab-1.html#introduction) which is great for a first pass. The whole thing made me realize how inarticulate one seems when transcribing their thought process.
