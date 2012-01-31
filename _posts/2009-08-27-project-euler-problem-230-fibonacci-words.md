--- 
created_at: 2009-08-27 08:18:00 -05:00
layout: post
typo_id: 23
title: "Project Euler - Problem 230: Fibonacci Words"
tags: [projecteuler, problem, mathematics, fibonacci, goldenratio]
---
<p>I wrote a Python script to solve <a href="http://projecteuler.net/index.php?section=problems&id=230">Problem 230</a> on Project Euler. You can read the problem via the link. It involves a sequence known as <a href="http://en.wikipedia.org/wiki/Fibonacci_word">Fibonacci Word</a>. The sequences goes as follows:</p>

	A
	B
	AB
	BAB
	ABBAB
	BABABBAB
	...

<p>The above sequence of words is Fibonacci in that the length of the words form the sequence 1, 1, 2, 3, 5, 8, ...</p>
<p>My solution uses the <a href="http://en.wikipedia.org/wiki/Golden_ratio">Golden Ratio</a> as a way to figure out whether we are in the A or B. The relationship between <a href="http://en.wikipedia.org/wiki/Fibonacci">Fibonacci</a> sequence and Gold Ratio is pretty well known.</p>

	g = 1.6180339887498949 # golden ratio

	t = (
		'14159265358979323846264338327950288419716939937510' +
		'58209749445923078164062862089986280348253421170679',
		'82148086513282306647093844609550582231725359408128' +
		'48111745028410270193852110555964462294895493038196'
	)

	l = len(t[0])

	def D(n):
		i = (n-1) % l
		j =  (n-1) // l
		k = 1 if j-1 <= j//g * g < j else 0 # magic
		return int(t[k][i])

	print sum([10**i * D((127 + 19*i) * 7**i) for i in range(18)])

<p>Another good read about this topic is the <a href="http://en.wikipedia.org/wiki/L-System">L-system</a>, and also the <a href="http://mathforum.org/dr.math/faq/faq.golden.ratio.html">Fibonacci Rectangle</a>.</p>
<p>Math rocks! :)</p>
