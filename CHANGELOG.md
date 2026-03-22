<!--Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.-->

### 2026-03-22

1. Fix case-insensitive sorting for favorites (Issue #81)
2. Fix file opening issue for files with special characters like '#' (Issue #77)
3. Enhance file rename handling to automatically update favorite paths (Issue #79)

### 2026-03-21

1. Modernize build system: Replace Gulp with esbuild for faster builds
2. Upgrade dependencies and TypeScript to latest versions
3. Replace nconf with VS Code built-in configuration API
4. Unify file system operations using VS Code file system API
5. Implement incremental update for tree view to improve performance
6. Refactor command handling to properly handle async operations
7. Add error handling and user feedback
8. Improve code quality and type safety
9. Update VS Code engine requirement to ^1.80.0

### 2021-10-19

1. Support group feature (by [@s19514tt](https://github.com/s19514tt))

### 2020-05-14

1. Support double click feature (by [@gjsjohnmurray](https://github.com/gjsjohnmurray))
2. Support refresh feature (by [@gjsjohnmurray](https://github.com/gjsjohnmurray))
3. Improve documentation (by [@gjsjohnmurray](https://github.com/gjsjohnmurray))
4. Support "Reveal in Side Bar" (by [@gjsjohnmurray](https://github.com/gjsjohnmurray))

### 2020-05-13

1. Support remote resources (by [@gjsjohnmurray](https://github.com/gjsjohnmurray))
2. Commands description improvement (by [@gjsjohnmurray](https://github.com/gjsjohnmurray))
3. Commands that should not be used in cmd palette is hidden from palette now (by [@gjsjohnmurray](https://github.com/gjsjohnmurray))
4. "Reveal In Finder" improvement (by [@gjsjohnmurray](https://github.com/gjsjohnmurray))

### 2020-04-15

1. Support `Reveal In Finder` (by [@geforcesong](https://github.com/geforcesong))

### 2018-03-22

1. Enable add/delete func for activeEditor. Which means you can now add/delete assets from an active editor
2. Enter into ASC mode while click `toggleSort` button in MANUAL mode
3. Sort descendant assets in ASC mode while in MANUAL mode

### 2018-03-19

1. Add sort button at navigation bar
2. Refactor sort func to fix [sort issue](https://github.com/leftstick/vscode-favorites/issues/3#issuecomment-373995913)

### 2018-03-17

1. Sort favorites for directories and files separately
2. Add tooltip

### 2018-02-23

1. Add file icon support

### 2018-01-29

1. Add new configuration `saveSeparated`

### 2017-07-24

1. Arrange menu items in natural order

### 2017-06-30

1. Add sorting support
2. Add `MANUAL` sorting support
