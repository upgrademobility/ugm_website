[![pages-build-deployment](https://github.com/upgrademobility/open-pro-html/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/upgrademobility/open-pro-html/actions/workflows/pages/pages-build-deployment)

# UGM Website


## Details

SVG Icons: https://icons.getbootstrap.com/
KIT Colors: https://raw.githubusercontent.com/camminady/kitcolors/master/example.png

## Getting started

* First, ensure that node.js & npm are both installed. If not, choose your OS and installation method from [this page](https://nodejs.org/en/download/package-manager/) and follow the instructions.
* Next, use your command line to enter your project directory.
* Ready-to-use package file is called `package.json`. You just need to run `npm install` to install all of the dependencies into your project.
* When `npm` has finished with the install, run `npm run build` to recompile the `style.css` file in the root directory.

Useful task for rapid development is `npm run dev`, which rebuild the CSS every time you make a change in the HML or JS files.

### Development under WSL
- Go to your user root (cd ~)
- Open .bashrc in your chosen editor (vi, nano, etc.)
- Append to the end of the file: export PATH=$(echo "$PATH" | sed -e 's/:\/mnt[^:]*//g') # strip out problematic Windows %PATH%
