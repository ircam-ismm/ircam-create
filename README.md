# Ircam | create

[![npm version](https://badge.fury.io/js/@ircam%2Fcreate.svg)](https://badge.fury.io/js/@ircam%2Fcreate)

Interactive command line tools for scaffolding simple test apps and demos.

## Usage

```sh
npx @ircam/create@latest [dirname]
```

```
Usage: create [options] [dirname]

Arguments:
  dirname                  Directory in which we should create the project

Options:
  -t, --template <string>  Template to use
  -h, --help               display help for command
```

## Development notes

To develop the generator locally:

```sh
// link globally
// in `ircam-create` directory:
sudo npm link
// to create an app
npx @ircam/create
// unlink globally
sudo npm unlink --global @item/create
npm ls --global
```

## Credits

[https://soundworks.dev/credits.html](https://soundworks.dev/credits.html)

## License

[BSD-3-Clause](./LICENSE)
