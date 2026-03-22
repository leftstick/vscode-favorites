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

### Add to Favorites

An **Add to Favorites** command in Explorer's context menu saves links to your favorite files or folders into your _*`XYZ`*_`.code-workspace` file if you are using one, else into the `.vscode/settings.json` file of your root folder.

### Toggle Favorite for Active File

Use the **Toggle Favorite** command from the Command Palette (`cmd`/`ctrl` + `shift` + `p`) to quickly add or remove the currently active file from your favorites.

### Toggle Folder Favorite for Active File

Use the **Toggle Folder of Active File** command from the Command Palette (`cmd`/`ctrl` + `shift` + `p`) to quickly add or remove the folder containing the currently active file from your favorites.

Your favorites are listed in a separate view and can be quickly accessed from there.

### Configuration

```javascript
{
    "favorites.resources": [], // resources path you prefer to mark
    "favorites.sortOrder": "ASC", // DESC, MANUAL
    "favorites.saveSeparated": false // whether to use an extra config file
    "favorites.groups": ["Default"], // the groups you have created
    "favorites.currentGroup": "Default" // determine the current using group
}
```

> You normally don't need to modify this config manually. Use context menus instead.

## Changelog

[Changelog on Marketplace](https://marketplace.visualstudio.com/items/howardzuo.vscode-favorites/changelog)

## LICENSE

[GPL v3 License](https://raw.githubusercontent.com/leftstick/vscode-favorites/master/LICENSE)

## Development

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/leftstick/vscode-favorites.git
   cd vscode-favorites
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Run development server**:
   ```bash
   pnpm run watch
   ```

4. **Launch extension**:
   - Press `F5` in VS Code
   - This will open a new VS Code window with the extension loaded

### Build and Test

1. **Build the extension**:
   ```bash
   pnpm run build
   ```

2. **Run tests**:
   ```bash
   pnpm run test
   ```

3. **Package the extension**:
   ```bash
   pnpm run package
   ```

### Contribution Guidelines

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests** to ensure your changes don't break existing functionality
5. **Commit your changes** with a descriptive commit message
6. **Push to your fork**
7. **Create a pull request**

### Code Style

- Follow TypeScript best practices
- Use `async/await` for asynchronous operations
- Add appropriate error handling
- Write clear and concise comments
- Maintain consistent code formatting

### Development Tools

- **TypeScript**: For type-safe code
- **esbuild**: For fast builds
- **Mocha**: For unit tests
- **VS Code Test**: For extension integration tests

[vs-url]: https://marketplace.visualstudio.com/items?itemName=howardzuo.vscode-favorites
[vs-image]: https://img.shields.io/visual-studio-marketplace/v/howardzuo.vscode-favorites
[install-url]: https://img.shields.io/visual-studio-marketplace/i/howardzuo.vscode-favorites
[rate-url]: https://img.shields.io/visual-studio-marketplace/r/howardzuo.vscode-favorites
[license-url]: https://img.shields.io/github/license/leftstick/vscode-favorites
