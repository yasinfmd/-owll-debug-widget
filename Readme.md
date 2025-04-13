# @owll/debug-widget

`@owll/debug-widget` is a lightweight and customizable debug widget designed for web applications. It allows developers to capture and download logs (both console and network), take screenshots, and gain insights into the application's behavior. It can be used in both development and production environments to streamline the debugging process.

## Features

- **Capture Console Logs**: Capture and download console logs in JSON format for structured review.
- **Capture Network Logs**: Capture and download network request logs in JSON format, offering valuable information on network activities, including those made with native `fetch` and `XMLHttpRequest`.
- **Take Screenshot**: Take a screenshot of the page (without the debug button) and download it as a PNG file.
- **Customizable Position and Theme**: Adjust the widget's button position on the screen and modify its theme to suit your app's design or match system settings (dark/light mode).



## Installation

You can install the widget using either npm or yarn:

```bash
npm install @owll/debug-widget
# or
yarn add @owll/debug-widget
 ```
## Implementation

To integrate and start the debug widget in your web application, follow these steps:

1.  **Import the `startOwllDebugWidget` function:**

    ```javascript
    import startOwllDebugWidget from '@owll/debug-widget';
    ```

2.  **Call the `startOwllDebugWidget` function:**

    You can initialize the widget with default settings by simply calling the function:

    ```javascript
    startOwllDebugWidget();
    ```

    Alternatively, you can provide a configuration object of type `DebugOptions` to customize its behavior:

    ```javascript
    interface DebugOptions {
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      theme?: 'light' | 'dark' | 'auto';
    }

    const options: DebugOptions = {
      position: 'bottom-left', // Optional: 'top-left', 'top-right', 'bottom-left' (default: 'bottom-left')
      theme: 'auto'         // Optional: 'light', 'dark' (default: 'light')
    };

    startOwllDebugWidget(options);
    ```

    The available configuration options within the `DebugOptions` interface are:

    -   `position`: Controls the position of the debug button on the screen. Possible values are `'top-left'`, `'top-right'`, `'bottom-left'`, and `'bottom-right'`. Defaults to `'bottom-left'`.
    -   `theme`: Sets the visual theme of the widget. Possible values are `'light'`, `'dark'`, and `'auto'`. When set to `'auto'`, the theme will typically follow the user's system preference. Defaults to `'light'`.

    Refer to the official documentation for any other available configuration options.

This demonstrates how to use the `DebugOptions` interface to configure the widget with specific `position` and `theme` values.