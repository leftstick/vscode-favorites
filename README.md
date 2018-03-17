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
    "favorites.resources": [], // resources path you prefer to mark
    "favorites.sortOrder": "ASC", // DESC, MANUAL
    "favorites.saveSeparated": false // whether to use an extra config file
}
```

> You don't need handle this config manually, but with context menu instead.

## Change Log

### 2018-03-17

1.  sort favorites for directories and files separately
2.  add tooltip

### 2018-02-23

1.  add file icon support

### 2018-01-29

1.  add new configuration `saveSeparated`

### 2017-07-24

1.  arrange menu items in natural order

### 2017-06-30

1.  add sorting support
2.  add `MANUAL` sorting support

## LICENSE

[GPL v3 License](https://raw.githubusercontent.com/leftstick/vscode-favorites/master/LICENSE)

[vs-url]: https://marketplace.visualstudio.com/items?itemName=howardzuo.vscode-favorites
[vs-image]: https://vsmarketplacebadge.apphb.com/version/howardzuo.vscode-favorites.svg
[install-url]: https://vsmarketplacebadge.apphb.com/installs/howardzuo.vscode-favorites.svg
[rate-url]: https://vsmarketplacebadge.apphb.com/rating/howardzuo.vscode-favorites.svg
[license-url]: https://img.shields.io/github/license/leftstick/vscode-favorites.svg
