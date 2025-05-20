# Standard Suite Common classes and commands for most applications.

```
close v : Close an object.
close specifier : the object for the command
[ saving ask/no/yes] : Specifies whether changes should be saved before
closing.
[ saving in alias] : The file in which to save the object.
```
```
count v : Return the number of elements of a particular class within an object.
count specifier : the object for the command
[ each type] : The class of objects to be counted.
→ integer
```
```
delete v : Delete an object.
delete specifier : the object for the command
```
```
duplicate v : Copy object(s) and put the copies at a new location.
duplicate specifier : the object for the command
[ to location specifier] : The location for the new object(s).
[ with properties record] : Properties to be set in the new duplicated object(s).
```
```
exists v : Verify if an object exists.
exists specifier : the object for the command
→ boolean
```
```
get v : Get the data for an object.
get specifier : the object for the command
→ any
```
```
make v : Make a new object.
make
new type : The class of the new object.
[ at location specifier] : The location at which to insert the object.
[ with data any] : The initial data for the object.
[ with properties record] : The initial values for properties of the object.
→ specifier
```
```
move v : Move object(s) to a new location.
move specifier : the object for the command
to location specifier : The new location for the object(s).
```

**open** _v_ : Open an object.

```
open alias : The file(s) to be opened.
→ document
```
**print** _v_ : Print an object.

```
print alias : The file(s) or document(s) to be printed.
[ print dialog boolean] : Should the application show the Print dialog?
[ with properties print settings] : the print settings
```
**quit** _v_ : Quit an application.

```
quit
[ saving ask/no/yes] : Specifies whether changes should be saved before
quitting.
```
**save** _v_ : Save an object.

```
save specifier : the object for the command
[ as text] : The file type in which to save the data.
[ in alias] : The file in which to save the object.
```
**set** _v_ : Set an object's data.

```
set specifier : the object for the command
to any : The new value.
```
**application** _n_ [inh. item] : An application's top level scripting object.

```
ELEMENTS
contains documents, windows.
PROPERTIES
frontmost (boolean, r/o) : Is this the frontmost (active) application?
name (text, r/o) : The name of the application.
version (text, r/o) : The version of the application.
```
**color** _n_ [inh. item] : A color.

**document** _n_ [inh. item] : A document.

```
ELEMENTS
contained by application.
PROPERTIES
modified (boolean, r/o) : Has the document been modified since the last save?
name (text) : The document's name.
path (text) : The document's path.
```
**item** _n_ : A scriptable object.


```
PROPERTIES
class (type, r/o) : The class of the object.
properties (record) : All of the object's properties.
```
```
window n [inh. item] : A window.
ELEMENTS
contained by application.
PROPERTIES
bounds (rectangle) : The bounding rectangle of the window.
closeable (boolean, r/o) : Whether the window has a close box.
document (document, r/o) : The document whose contents are being displayed in
the window.
floating (boolean, r/o) : Whether the window floats.
id (integer, r/o) : The unique identifier of the window.
index (integer) : The index of the window, ordered front to back.
miniaturizable (boolean, r/o) : Whether the window can be miniaturized.
miniaturized (boolean) : Whether the window is currently miniaturized.
modal (boolean, r/o) : Whether the window is the application's current modal
window.
name (text) : The full title of the window.
resizable (boolean, r/o) : Whether the window can be resized.
titled (boolean, r/o) : Whether the window has a title bar.
visible (boolean) : Whether the window is currently visible.
zoomable (boolean, r/o) : Whether the window can be zoomed.
zoomed (boolean) : Whether the window is currently zoomed.
```
# Text Suite A set of basic classes for text processing.

```
attachment n [inh. text > item] : Represents an inline text attachment. This class is
used mainly for make commands.
ELEMENTS
contained by attribute runs, characters, paragraphs, texts, words.
PROPERTIES
file name (text) : The path to the file for the attachment
```
```
attribute run n [inh. item] : This subdivides the text into chunks that all have the
same attributes.
ELEMENTS
contains attachments, attribute runs, characters, paragraphs, words; contained by
attribute runs, characters, paragraphs, texts, words.
PROPERTIES
color (color) : The color of the first character.
font (text) : The name of the font of the first character.
size (integer) : The size in points of the first character.
```
```
character n [inh. item] : This subdivides the text into characters.
```

```
ELEMENTS
contains attachments, attribute runs, characters, paragraphs, words; contained by
attribute runs, characters, paragraphs, texts, words.
PROPERTIES
color (color) : The color of the first character.
font (text) : The name of the font of the first character.
size (integer) : The size in points of the first character.
```
```
paragraph n [inh. item] : This subdivides the text into paragraphs.
ELEMENTS
contains attachments, attribute runs, characters, paragraphs, words; contained by
attribute runs, characters, paragraphs, texts, words.
PROPERTIES
color (color) : The color of the first character.
font (text) : The name of the font of the first character.
size (integer) : The size in points of the first character.
```
```
text n [inh. item] : Rich (styled) text
ELEMENTS
contains attachments, attribute runs, characters, paragraphs, words.
PROPERTIES
color (color) : The color of the first character.
font (text) : The name of the font of the first character.
size (integer) : The size in points of the first character.
```
```
word n [inh. item] : This subdivides the text into words.
ELEMENTS
contains attachments, attribute runs, characters, paragraphs, words; contained by
attribute runs, characters, paragraphs, texts, words.
PROPERTIES
color (color) : The color of the first character.
font (text) : The name of the font of the first character.
size (integer) : The size in points of the first character.
```
# Type Definitions Records used in scripting CrossOver

```
print settings n
PROPERTIES
copies (integer) : the number of copies of a document to be printed
collating (boolean) : Should printed copies be collated?
starting page (integer) : the first page of the document to be printed
ending page (integer) : the last page of the document to be printed
pages across (integer) : number of logical pages laid across a physical page
pages down (integer) : number of logical pages laid out down a physical page
requested print time (date) : the time at which the desktop printer should print
the document
```

**error handling** (standard/detailed) : how errors are handled
**fax number** (text) : for fax number
**target printer** (text) : for target printer