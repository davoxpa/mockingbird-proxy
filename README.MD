# Mockingbird Proxy

<img src="./src/assets/logo/mocking-bird-proxy-logo-1024.jpg" alt="Mockingbird Proxy Interface" width="100">

## Download
Try it by downloading the latest software version.
It's an executable for Windows, Linux, and Mac that requires no installation.
[Download latest version](https://github.com/davoxpa/mockingbird-proxy/releases)

## Introduction
Mockingbird Proxy is a powerful development tool acting as an intermediary between your frontend/backend and external APIs, automatically storing all API calls in JSON files.

## Features
- **Automatic Storage**: Saves all API calls.
- **Modify Responses**: Customize API responses and status codes.
- **Caching**: Accelerates loading during development.
- **Flexibility**: Easily switch from cache to real responses.

## Configuration
- **Port and Path**: Set the port and the path for saving JSON files.
- **Integration**: Modify the URL in development to use the proxy.

## Getting Started

Mockingbird-Proxy is an effective tool for API mocking during application development. This guide will show you how to start using it.

## Starting the Mockingbird-Proxy Application

### Step 1: Starting the Application

1. Start the Mockingbird-Proxy application.
2. In the top right panel, find the option to change the port.
3. Choose the desired port and start the server.

### Step 2: Configuration in Your Project

After starting the Mockingbird-Proxy server, redirect your API calls through the proxy.

For example, change:  
`https://my-backend.com/api/v1/blog/posts`  
to:  
`http://localhost:3000/https://my-backend.com/api/v1/blog/posts`  

Add `http://localhost:3000/` as a prefix to your backend URL to use the mocking server.

---

## Benefits
- **Data Model Documentation**: Useful for storing the data model of API calls.
- **Elimination of CORS Issues**: Facilitates development by avoiding CORS issues.
- **Extended Compatibility**: Supports various frameworks and platforms.

## Screenshots
![Page select working dir to save json](./screenshot/select-mock-dir.png)
![Page List mock](./screenshot/list-mock-api.png)
![Page edit mock](./screenshot/edit-mock-api.png)

<video width="100%" height="600" controls autoplay loop muted>
    <source src="./screenshot/mockingbird-proxy-video-1.mp4" type="video/mp4">
    Il tuo browser non supporta il tag video.
</video>

## Roadmap
- [x] Add functionality to modify responses.
- [x] Add functionality to modify status codes.
- [x] Add caching functionality.
- [x] Add functionality for single URL bypass.
- [x] Add functionality for massive bypass.
- [x] Add functionality to delete all files.
- [x] Add functionality to search among mocks.
- [x] Add functionality to create mocks.
- [] Add a monitor for API call logs.

## Contributing

We appreciate every contribution to Mockingbird Proxy! Here's how you can participate:

1. **Fork the Repository**: Visit the [GitHub repository](https://github.com/davoxpa/mockingbird-proxy/) and create a fork.
2. **Create a Branch**: From your fork, create a new branch for your changes.
3. **Make Changes**: Implement your ideas and fixes.
4. **Submit a Pull Request**: Once you've tested your changes, submit a pull request to the main branch.
5. **Review**: We will review your pull request and provide feedback.

Every contribution, big or small, is greatly appreciated. Thank you for your support!

## License
Apache License 2.0
