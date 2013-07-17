# documentor.js

Source code documentation generator written in JS and aiming for speed, flexibility and convenience.

It is:

* portable - it can run from the command line or in the browser
* modular - source code loading, processing and documentation generation are executed in separate modules which allows each to be configured as needed
* instant - with the available renderer there's no need to generate static HTML files before you can see the docs
* source code's language agnostic - the included parser doesn't actually read the source code - it reads javadoc-style comments and the rest is simply ignored 
* flexible - depending on the setup could load source files from different locations, can process different languages and documentation formats and can generate different documentation layouts 

## Architecture
These are the usual steps of the process:

* a `Documentor.Api` object is first needed which will provide the packaging for all data and methods involved in building the API structure and generating the documentation files.  
* then a `Documentor.SourceLoader` object is needed which is able to load the source files from where they are stored (as local files or at some remote location).  
* each source file will then need to be processed by a `Documentor.SourceProcessor` object which has to update the API structure in the `Documentor.Api` object.  
* and finally the API structure is passed on to a `Documentor.render.DocumentationRenderer` object which will generate the docs (whether as static files or will print them in the current browser page).

## Customization
The classes in the package do not have many options to be configured but additional functionality can be added by sub-classing them. If for example you need to process different tags than what's available in `Documentor.PHGSourceProcessor` the easiest way to take is updating or adding in the `docTagProcessors` property. This will of course lead to the need to change the rendering object as it will have to be aware of the new tags and their meaning. 

## Examples
Those for now can only be found in the project's own _docs_ folder - there is `docs.html` which builds the documentation on-the-fly when loaded in the browser and `docs.js` which produces static documentation files when run in node.js.

## License
The MIT License, because it rules.
