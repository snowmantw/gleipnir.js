# Gleipnir

This is a library and abstract framework try to conquer common troubles of UI programming.
It's deeply inspired from the 'interesting' experiences of developing Gaia, an application layer of FirefoxOS.

The license is under Apache License (2.0). This is because most of code are from the Gaia project.


## Introduction

The most common problem during developing Gaia is how to organize our code to manage event-based communication model
with asynchronous flows come from certain APIs. For the event part, JavaScript, though its native APIs provide no
event mechanism[1], still becomes the most event-driven programming language in practice, partially because of the DOM
behaviors are event-driven, which is most natural way to handle arbitrary user inputs is event.
In other languages and paradigms it is also called as Signal, Behavior, or even Intention. No matter what name the they
adopt, the problem remains the same: how to organize code, in its nature tend to be imperative ('line-driven'),
with such discrete and unnatural aspect.

Some of the event-driven issues could be solved well with solutions provide a way to weave the event and the handlers,
which are usually methods of class instances in OOP languages. One of those famous solutions Qt adopted is Signals & Slots,
which means the toolkit would provide a way to 'weave' (via `QObject::connect`) events and handlers[2]. While other solutions
may include registering the handler with the instance & method in semantics level without the help from magic macros[3].
All of these are fine to solve the issue of implement event-driven programs with existing languages, including but not
only OOP and imperative ones.

Nevertheless, in JavaScript world we have one unique issue more complicated then handling event: the asynchronous
flows without available locks. In other language, no matter whether the work is truly parallel or just concurrent,
we have lots of way to `join` or `wait` those asynchronous flows to be done, and then the rest of code could keep
synchronous. So the asynchronous flows could be useful & manageable, while there are no real rooted problems of how
to compose the program with both asynchronous and synchronous code, which means the program could keep neat with
the ordinary variables, loops, conditional statements and vice versa. With such ability to sync-up asynchronous flows,
only those who want to tune performance of such programs need to worry about those advanced lock-free algorithms,
or other issues keep programmers aways from lock-like methods. On the contrary, JavaScript programmers need to manipulate
event-drive model *plus* asynchronous flows without any locking mechanism at the same time, which could really bother us
especially when intermittent bugs appear.

To solve the problem and make programs robust, Gaia programmers invented lots of methods to try to conquer the issue.
That's why we could find out at least 3 different state-machines in the codebase, and of course the old tricks of
temporary flags and variables scatter about everywhere. Some more clever idea include advanced Promise since the
only way to sequentialize asynchronous operations in JavaScript is to chain them with Promise, but the API is so
low-level and lacks lots of important features to adapt UI control. These works are all great and work well, at least
work well until the next regression emerges from the still broken abstract layer like the abyss. However, we've found
that it's still valuable to extract ideas from these works and make a new abstract layer to solve the most problems
we've encountered in our daily work. This is because that the existing solutions may have their own problems since
the specific domain they handle well is still too narrow, and also is too easy to be affected by problems from other domains:

* Temporary variables & flags: solved the practical issues quickly but also painfully, especially when the code grow
  faster than Jack's beans
* State machine: solve the 'asynchronous if...else' and event dispatching issues with a substantial theory, but most
  of implementations are all with too much details that never be described in the clear state-diagram, and thus
  the code become very twisted and messy
* Wrapped, or native Promise: the de facto solution to sequentialize asynchronous operations. Most of tricky parts
  that native Promise doesn't cover could be wiped out with extended Promises libraries. However, it doesn't care events,
  so how to weave these two different kinds of asynchronous modes is still a serious issue

Based on these solutions and with our (painful) experiences, we've discovered that the most issues in Gaia development,
in other words maybe the general UI programming issues in JavaScript, could be solved or at least identified if we follow
some principles:

1. There are no synchronous statements: since every function could be asynchronous, especially for the time being
   more and more browser APIs become asynchronous, synchronous functions would be eventually mixed with asynchronous ones
   to compose programs. So, if we still try to write naïve statements and hope every function we called are synchronous,
   the code would eventually need to be refactored with Promise-based style, since it's completely possible that someday someone need
   to implement a feature depends on a whole new asynchronous API. As a result, the only one reasonable way to generate sequentialized
   code, which is still the most intuitive style for most of programmers, are Promise-like 'statements' that treat every
   step it includes as an asynchronous step.

2. State machine is the final cure: despite asynchronous flow management is not covered by state machines, they're still
   the most clear way to handle events with the following program state changes. In fact, every event handler changes object or other
   program states should be treated as a new state of the state machine, and in this way it would be much clear than managing it
   with the only monolithic stateful object, which is unfortunately the most naïve way to handle event with specific context,
   due to the popularity of EventTarget API. A properly designed state machine could help us not only to avoid handle these complex
   changes within the single object, but also to describe conditions and the progress of transferring clearly.

3. Events happen every moment, so to queue them is the most basic and important premise of event handling: in Gaia we aren't
   always aware of that events, especially for those hardware events triggered from user, would happen every moment. That's one
   major cause why intermittent bugs occur and why the OS get broken under some edge cases that some of them are not really so edging.

4. Although an omnipresent event queue is necessary, it doesn't mean events are all with the same priority. Some special events
   should be handled immediately without queuing. These events are usually those relevant to the state transferring, which would
   interrupt the current queue and stop the remaining handlers that still waits to be executed. So we call events like these as
   'interrupts', and the architecture should provide reasonable way to manage them without causing racing and others
   traditional troubles without queues.

5. It's unwise to design an state machine that contains all states of the program at the same level, since the complexity of
   transferring rules would become too messy to manage and understand. So there should be not only one state machine controls
   all program states, but **multiple state machines** which are encapsulated as components. Each component contains necessary
   states and the resources they control, and parents and children could communicate with each other with event messages.

[1]: http://www.ecma-international.org/ecma-262/5.1/
[2]: http://doc.qt.digia.com/4.6/qobject.html#connect
[3]: https://msdn.microsoft.com/en-us/library/ms366768(v=vs.110).aspx
