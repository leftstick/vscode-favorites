# vscode-favorites

[![vscode version][vs-image]][vs-url]
![][install-url]
![][rate-url]
![][license-url]

An extension helps developer marking resources as favorite. Therefor, those resources can be easily found.

![](https://raw.githubusercontent.com/leftstick/vscode-favorites/master/images/preview.gif)

## Install

Launch VS Code Quick Open (`cmd`/`ctrl` + `p`), paste the following command, and press enter.

```
ext install favorites
```

## Usage

`vscode-favorites` save your favorite resource in workspace `settings.json`, and show them in a separate view

### Configuration

```javascript
{
    "favorites.resources": [] //resources path you prefer to mark
}
```

>You don't need handle this config manually, but with context menu instead.

## LICENSE ##

[GPL v3 License](https://raw.githubusercontent.com/leftstick/vscode-favorites/master/LICENSE)


[vs-url]: https://marketplace.visualstudio.com/items?itemName=howardzuo.vscode-favorites
[vs-image]: http://vsmarketplacebadge.apphb.com/version/howardzuo.vscode-favorites.svg
[install-url]: http://vsmarketplacebadge.apphb.com/installs/howardzuo.vscode-favorites.svg
[rate-url]: http://vsmarketplacebadge.apphb.com/rating/howardzuo.vscode-favorites.svg
[license-url]: https://img.shields.io/github/license/leftstick/vscode-favorites.svg