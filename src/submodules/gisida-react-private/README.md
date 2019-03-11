# gisida-react-private

This is a private submodule repo that stores proprietary react components for [gisida](https://github.com/onaio/gisida)

The following steps allows you  to use this repo in sites that run off [gisida](https://github.com/onaio/gisida) and [gisida-react](https://github.com/onaio/gisida-react):

- change directory to project folder

```shell
$ cd /path/to/project # e.g. ./irfsomalia, ./service-mapping, ../openreblock
```

- Add `gisida-react-private` as a submodule

```shell
$ git submodule add git@github.com:onaio/gisida-react-private.git src/submodules/gisida-react-private
```

- Import/Require componets from submodules the usual way e.g.

```javascript
import Filter from './submodules/gisida-react-private/src/components/Filter/Filter';
import TimeSeriesSlider from './submodules/gisida-react-private/src/components/TimeSeriesSlider/TimeSeriesSlider';
```


**NOTE:**
 - Enable submodule summary if you'll be making changes to components in `gisida-react-private`. 
```shell
$  git config --global status.submoduleSummary true

```
 - Make sure to commit and push changes within the submodule folder itself:
 
 ```shell
$ cd src/submodules/gisida-react-private
$ git status
$ git add .
$ git commit -m "Updated submodule"
$ git push

```

 - Make sure to update the submodule in your project repo once it's updated using:

```shell
$ $ cd /path/to/project # e.g. ./irfsomalia, ./service-mapping, ../openreblock
$ git submodule foreach git pull
```
