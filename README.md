Foothold
======

A template for creating JavaScript apps with a grunt-driven build process.

======

A pre-commit hook is defined in /pre-commit that runs jshint. To use the hook, run the following:

ln -s ../../pre-commit.sh .git/hooks/pre-commit

A post-commit hook is defined in /post-commit that runs the Plato complexity analysis tools. To use the hook, run the following:

ln -s ../../post-commit.sh .git/hooks/post-commit

To install Plato, run the following.

npm install -g plato

