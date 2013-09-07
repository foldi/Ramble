Ramble
======

Ramble is a collection of experiments using force directed input to control an infinite scroller. Pulling down on the scroller applies a upward or downward force on the objects in the viewport.

Check out examples the 'public' or visit http://foldi.github.io/Ramble to see them in action.

Ramble experiments are compatible with the latest version of Chrome.

Building this project
======

This project uses [Grunt](http://gruntjs.com). To build the project first install the node modules.

```
npm install
```

Next, run grunt.

```
grunt
```

A pre-commit hook is defined in /pre-commit that runs jshint. To use the hook, run the following:

```
ln -s ../../pre-commit .git/hooks/pre-commit
```

A post-commit hook is defined in /post-commit that runs the Plato complexity analysis tools. To use the hook, run the following:

```
ln -s ../../post-commit .git/hooks/post-commit
```
