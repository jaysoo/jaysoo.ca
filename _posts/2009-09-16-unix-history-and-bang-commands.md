--- 
created_at: 2009-09-16 11:07:00 -05:00
layout: post
typo_id: 28
title: Unix history and bang commands
---
<p>The Unix bash shell provides many useful tools, one of them being then <code>history</code> command.</p>
<p>To see a list of previously executed commands, execute history into your shell. You can also supply an integer argument to limit the number of commands to show.</p>
<pre >
history 10</pre>
<p>This can be piped into other commands, which can be useful for many purposes. For example, if I just finished a series of steps to get something working and wish to write a how-to entry for it, I could execute this:</p>

	history | cut -d ' ' -f 5- # cut out only the commands

<p>The bash shell also provides the bang (!) command to execute the last command matching the provided command name.</p>

	$ echo foo
	foo
	$ !echo
	echo foo
	foo

<p>Or you can use bang-bang (!!) to execute the last command</p>

	$ echo bar
	bar
	$ !!
	echo bar
	bar

<p>This is useful when you get a permission denied error because you forgot to sudo.</p>

	$ Make me a sandwich.
	What? Make it yourself.
	$ sudo !!
	Okay.

<p>You can also print the matching command without executing it via the :p modifier. This will also copy that matching command to the end of your history.</p>

	$ echo faz
	faz
	$ !!:p
	echo faz
	$ !!
	echo faz
	faz

<p>To substitute certain parts of a command, you can use the :s modified.</p>

	$ echo baz
	baz
	$ !!:s/baz/Hello, World/

<p>You can combine both modifiers as well, to preview a command before executing... might be a good idea if the command may cause damage.</p>
<p>Retrieving only arguments from a command can be done using the :$ :^, :n, and :* modifiers. The $ and ^ will look familiar to anyone who knows regex, they match the last and first arguments respectively. The :n modifier will match argument at position <em>n</em> (first argument being :1), and :* retrieves all arguments.</p>

	$ mkdir foobar && cd foobar # make temp dir
	$ touch file1 file2 file3 file23 file20 # dummy files
	$ ls
	file1 file2 file3 file23 file20
	$ ls file2* # list files match pattern
	file2	file20	file23
	$ rm !!:* # remove previously matched files
	rm file2*$ ls
	file1	file3

<p>You can also use the :0 modifier to match the command name, but I don't really see the use in that.</p>
<p>One last thing about history. You can start an interactive search through history by press Ctrl+r (^R), which will interactively display commands matching what you are typing (in reverse history order).</p>
