This is a demo of single responsibility, open/closed principle, as well as using the constructor pattern in Node.js.
We also use closures, recursion, reduce, as well as some other functional programming concepts.

There are some very basic unit and integration tests that we can run using the following command:

```
$ node SpecFileLoader.js 
```

Here are some properties of this code:
- The module easily plugs into any system needing to get a collection of files recursively from a folder. 
- The module is unit tested and integration tested.
- Private variables and functions are scoped as locally as possible. 
- Private functions are kept towards the bottom of modules they're used in, while public functions are at top.
- We can add new functionality, such as getting all image files or sorting the array, without modifying code.
- There are 15 functions in this module, but only 3 will be public. This makes it clear how to use the module.


Comments are not needed. The purpose of the comments in this example is only to identify areas where the above
principles and properties of the code are used, for the purpose of learning.  For instance, one comment points out
where recursion is used.

We also include two `ClientExample*.js` files, which demonstrate loading the module and using it via the two 
public methods.

```
$ node ClientExample.js
```

```
$ node ClientExampleLoginAtTop.js
```

The folder `__SpecFileLoader-testFiles__` contains some dummy files of different extension types (js, txt, png, json, dat, etc)
to use as test data for the integration tests and the client examples.
