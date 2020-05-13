# vscode-favorites

[![vscode version][vs-image]][vs-url]
![][install-url]
![][rate-url]
![][license-url]

An extension that lets the developer mark resources (files or folders) as favorites, so they can be easily accessed.

![](https://raw.githubusercontent.com/leftstick/vscode-favorites/master/images/preview.gif)

## Install

Launch VS Code Quick Open (`cmd`/`ctrl` + `p`), paste the following command, and press Enter.

```
ext install howardzuo.vscode-favorites
```

## Usage

An __Add to Favorites__ command in Explorer's context menu saves links to your favorite files or folders into your _*`XYZ`*_`.code-workspace` file if you are using one, else into the `.vscode/settings.json` file of your root folder.

Your favorites are listed in a separate view and can be quickly accessed from there.

### Configuration

```javascript
{
    "favorites.resources": [], // resources path you prefer to mark
    "favorites.sortOrder": "ASC", // DESC, MANUAL
    "favorites.saveSeparated": false // whether to use an extra config file
}
```

> You normally don't need to modify this config manually. Use  context menus instead.

## Changelog

[Changelog on Marketplace](https://marketplace.visualstudio.com/items/howardzuo.vscode-favorites/changelog)

## LICENSE

[GPL v3 License](https://raw.githubusercontent.com/leftstick/vscode-favorites/master/LICENSE)

[vs-url]: https://marketplace.visualstudio.com/items?itemName=howardzuo.vscode-favorites
[vs-image]: https://vsmarketplacebadge.apphb.com/version/howardzuo.vscode-favorites.svg
[install-url]: https://vsmarketplacebadge.apphb.com/installs/howardzuo.vscode-favorites.svg
[rate-url]: https://vsmarketplacebadge.apphb.com/rating/howardzuo.vscode-favorites.svg
[license-url]: https://img.shields.io/github/license/leftstick/vscode-favorites.svg
