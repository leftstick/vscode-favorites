# vscode-favorites

[![vscode version][vs-image]][vs-url]
![][install-url]
![][rate-url]
![][license-url]

An extension helps developer marking resources as favorite. Therefor, those resources can be easily found.

![](https://raw.githubusercontent.com/leftstick/vscode-favorites/master/images/gitk.gif)

## Install

Launch VS Code Quick Open (`cmd`/`ctrl` + `p`), paste the following command, and press enter.

```
ext install favorites
```

## Usage

I assume you have [git](https://git-scm.com/) installed.

`vscode-favorites` will `log` your selected document, and display log information into a separate view

### Configuration

```javascript
{
    "favorites.resources": [] //resources path you prefer to mark
}
```

## LICENSE ##

[GPL v3 License](https://raw.githubusercontent.com/leftstick/vscode-favorites/master/LICENSE)


[vs-url]: https://marketplace.visualstudio.com/items?itemName=howardzuo.vscode-favorites
[vs-image]: http://vsmarketplacebadge.apphb.com/version/howardzuo.vscode-favorites.svg
[install-url]: http://vsmarketplacebadge.apphb.com/installs/howardzuo.vscode-favorites.svg
[rate-url]: http://vsmarketplacebadge.apphb.com/rating/howardzuo.vscode-favorites.svg
[license-url]: https://img.shields.io/github/license/leftstick/vscode-favorites.svg