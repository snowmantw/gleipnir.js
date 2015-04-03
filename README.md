# Gleipnir

This is a library and abstract framework try to conquer common troubles of UI programming.
It's deeply inspired from the 'interesting' experiences of developing Gaia, an application layer of FirefoxOS.

The license is under Apache License (2.0). This is because most of code are from the Gaia project.


## Introduction

The most common problem during developing Gaia is how to organize our code to manage event-based communication model
while remaining the racing-free invariance. JavaScript, though its native APIs provide no event mechanism[1], still
becomes the most event-driven programming language in practice. One reason of this is because the DOM are event-drive,
due to the most natural way to handle arbitrary user inputs is event. In other languages and paradigms it is also called
as Signal, Behavior, or even Intention. No matter what name the they adopt, the problem remains the same: how to organize
code, in its nature tend to be imperative ('line-driven'), with this discrete and unnatural aspect.

Some of the event-driven issues could be solved well with solutions provide a way to weave the event and the handlers,
which are usually methods of class instances in OOP languages. One of the most famous solutions is what Qt adopted: Signals & Slots,
which means the toolkit would provide a way to 'weave' (via `QObject::connect`) events and handlers[2], and other solutions
may include register the handler with the instance & method in semantics level without the help from magic macros[3].
All of these are fine to solve the issue of implement event-driven programs with existing languages, including but not
only OOP and imperative ones.

Nevertheless, in JavaScript world we have one unique issue more complicated then handling event: the asynchronous
flows without available lock. In other language, no matter whether the work is truly parallel or just concurrent,
we have lots of way to `join` or `wait` those asynchronous flows to be done, and then the rest of code could be
synchronous again. So the asynchronous flows could keep useful, while there are no really rooted problems of how
to compose the program with both asynchronous and synchronous code. And the most code of the program could keep
neat, with the ordinary variables, loops and conditional statements. Only those who want to tune performance of
such programs need to worry about those seems advanced lock-free algorithm, or other issues keep programmers
aways from lock-like ways to force sync the asynchronous flows. However, for JavaScript programmers to manipulate
event-drive model *plus* asynchronous flows without locking mechanism at the same time, is one major reason
why the daily works become so painful, especially when bugs usually occur intermittently.

To solve the problem and make programs robust, Gaia programmers invented lots of methods to try to conquer the issue.
That's why we could find out at least 3 different state-machines in the codebase, and of course the old tricks of
temporary flags and variables scatter about everywhere. Some more clever idea include advanced Promise since the
only way to sequentialize asynchronous operations in JavaScript is to chain them with Promise, but the API is so
low-level and lacks lots of important features to adapt UI control. These works are all great and work well, at least
work well until the next regressions emerges from broken abstract layer like the abyss. However, we've found that the
ideas of these works still could be extracted as a new abstraction to solve the most problems we've encountered in
our daily work, while the existing solutions may have their own problems because each domain they care about is too
narrow, and also is too easy to be affected by problems from other domains:

* Temporary variables & flags: solved the practical issues quickly but also painfully, especially when the code grow
  faster than Jack's beans
* State machine: solve the 'asynchronous if...else' and event dispatching issues with a substantial theory, but most
  of implementations they're all with too much details that never be described in the clear state-diagram, and thus
  the code become very twisted and messy
* Wrapped, or native Promise: the de facto solution to sequentialize asynchronous operations. Most of tricky parts
  that native Promise doesn't cover could be wiped out with extended Promises libraries. However, it cares no events,
  so how to weave these two different kinds of asynchronous modes is still a serious issue

Based on these solutions and with our painful experiences, we've discovered that the most issues in Gaia development,
in other words maybe the general UI programming in JavaScript, could be solved or at least identified by keeping some
invariances:

1. There are no synchronous statements: Since every function could be asynchronous, especially for the time being
   more and more browser APIs are asynchronous, synchronous functions would be eventually mixed with asynchronous ones
   to compose programs. So, if we still try to write naïve statements and hope every function we called are synchronous,
   the code would eventually need to be refactored with Promise-based style, since someday someone need to implement
   a feature that depends on a shining asynchronous API. As a result, the only one reasonable way to make sequentialized
   code, which is still the most intuitive style for most of programmers, are Promise-like 'statements' and treat every
   step it includes are all asynchronous steps.

[1]: http://www.ecma-international.org/ecma-262/5.1/
[2]: http://doc.qt.digia.com/4.6/qobject.html#connect
[3]: https://msdn.microsoft.com/en-us/library/ms366768(v=vs.110).aspx
