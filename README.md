# 🚀 Infinite USB

**Infinite USB** is a high-performance, cross-platform hardware flashing utility designed for speed, reliability, and a modern user experience. Whether you're creating a simple bootable Linux drive or a complex Multi-ISO "Infinite Boot" device, Infinite USB handles the heavy lifting with a beautiful Material You interface.

![Infinite USB Preview](https://picsum.photos/seed/infiniteusb/1200/600?blur=2)

## ✨ Key Features

*   **Standard Flash**: Fast, bit-perfect writing of `.iso` and `.img` files to any USB storage device.
*   **Infinite Boot (Multi-ISO)**: Install a custom bootloader that allows you to store and boot from multiple ISO files on a single drive.
*   **Material You UI**: A dynamic interface that synchronizes with your system's accent colors for a native feel.
*   **Native Performance**: Built with **Tauri** and **Rust** for minimal resource usage and maximum write speeds.
*   **Cross-Platform**: Native support for Windows, macOS, Linux, and Android.

## 📥 Download

You can find the latest compiled binaries for all platforms in the [Releases](https://github.com/YOUR_USERNAME/infinite-usb/releases) section:

*   🪟 **Windows**: `.exe` Installer
*   🍎 **macOS**: `.dmg` (Universal)
*   🐧 **Linux**: `.AppImage`, `.deb`, `.rpm`
*   🤖 **Android**: `.apk` (Native)
*   📱 **iOS**: *Coming Soon*

## 🛠️ How to Build

This project uses **GitHub Actions** to automatically compile binaries for all platforms. 

### Automated Build (Recommended)
1.  Fork or push this repository to your GitHub account.
2.  Go to the **Actions** tab.
3.  The "Build and Release" workflow will trigger automatically on every push.
4.  Once finished, download your files from the generated **Draft Release**.

### Local Development
If you have the required toolchains (Rust, Node.js) installed:

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for your current platform
npm run tauri build
```

## 🐧 Linux Requirements
On some Linux distributions (like Arch), you may need `fuse2` to run the AppImage:
```bash
sudo pacman -S fuse2
```

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for the hardware community.*
