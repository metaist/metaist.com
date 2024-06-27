---
created: "2024-06-27T18:58:45Z"
updated: "2024-06-27T18:58:45Z"
title: "Generating Audiobooks"
tags:
  [
    "attrbox",
    "tts",
    "literature",
    "Coqui",
    "tachotron",
    "tortoise-tts",
    "ffmpeg",
    "kid3",
  ]
---

When I was in high school I used to use [Microsoft Agent](https://en.wikipedia.org/wiki/Microsoft_Agent) to read books from [Project Gutenberg](https://www.gutenberg.org/).

Now one of my sons has an old-school MP3 player and he wants to fill it with audiobooks. The [Internet Archive has a large collection of audiobooks](https://archive.org/details/audio_bookspoetry), but some of the books only come in text form.

On my wife's recommendation, I decided to try an make an audiobook out of the E.L. Konigsburg book [From The Mixed Up Files Of Mrs Basil E. Frankweiler](https://archive.org/details/FromTheMixedUpFilesOfMrsBasilEFrankweiler).

First, I downloaded the [text file](https://archive.org/stream/FromTheMixedUpFilesOfMrsBasilEFrankweiler/From_the_Mixed_up_Files_of_Mrs_Basil_E_Frankweiler_djvu.txt) and manually cut it up into chapters, one file per chapter.

Next, I converted all paragraphs into single lines.

Then I setup a python project using `rye` and `uv`:

```bash
curl -sSf https://rye.astral.sh/get | bash
rye config --set-bool behavior.use-uv=true
rye init
rye pin 3.11 # TTS doesn't support 3.12
rye add attrbox tts
```

[`attrbox`](https://github.com/metaist/attrbox) is my library for doing things like processing command-line arguments.

`tts` is the [Coqui.ai repository](https://github.com/coqui-ai/TTS) for doing text-to-speech. However, I just discovered that **Coqui.ai, the company behind the project is shutting down**, so I don't know how well this package will be maintained in the future.

Wrote up a quick script:

```python
#!/usr/bin/env python
"""Convert a text file to an MP3.

Usage: txt_tts
    [--help | --version][--debug]
    <input> [--output PATH]
    [--model PATH]

Options:
    -h, --help                  show this message and exit
    --version                   show program version and exit
    --debug                     show debug messages

    <input>                     input file
    -o PATH, --output PATH      output file

    --model PATH                model path [default: tts_models/en/ljspeech/tacotron2-DDC_ph]
"""
# std
from pathlib import Path

# lib
from attrbox import parse_docopt

__version__ = "0.1.0"
__pubdate__ = "2024-06-27T18:58:45Z"


def main():
    """Main entry point."""
    args = parse_docopt(__doc__, version=f"{__version__} ({__pubdate__})")
    args.input = Path(args.input)
    if not args.input.exists():
        raise FileNotFoundError(args.input)

    if not args.output:
        args.output = args.input.with_suffix(".wav")
    else:
        args.output = Path(args.output)

    if args.debug:
        print(args)

    from TTS.api import TTS

    tts = TTS(args.model)
    tts.tts_to_file(text=args.input.read_text(), file_path=args.output)


if __name__ == "__main__":
    main()
```

At first, I tried `tts_models/en/ljspeech/tacotron2-DDC` based on the examples I saw online. However, it had trouble with names and words that weren't part of its lexicon. The `_ph` version works on a phonetic level and has better performance while not being too slow. It takes about 3 minutes per chapter. (I did try [TortoiseTTS](https://github.com/neonbjb/tortoise-tts), but it was _extremely_ slow and the output wasn't that much better.)

The trickiest bit is making sure there aren't any empty sentences when the chapter gets split up. This can happen when you have a sentence at the end of a paragraph that ends with `."` and the quote mark ends up by itself. To fix this, I replaced those instances with `".` which worked great.

I ran the script on each chapter which produced a `.wav` file which I ran through `ffmpeg` to convert them to MP3.

As a final touch, I used [`kid3`](https://kid3.kde.org/) to fix all the tags so that the files would get sorted by album/track (i.e. book/chapter).
