--- 
created_at: 2009-02-24 22:40:00 -06:00
layout: post
typo_id: 8
title: Your Code Is Too Clever
tags: [clever, c, graphics, mathematics, approximation]
---
<p>As programmers we are often to <a href="http://en.wikipedia.org/wiki/KISS_principle">keep things simple</a>, and not to be too clever. While I agree with these principles most of the time, I hope that they are not used as an excuse to avoid finding better solutions for our problems.</p>
<p>How do we define <em>too clever</em>? If we read a code that we can't understand right away, does it mean it's too clever?</p>
<p>Let's take a look at one of the most clever use of <em>case </em>label fall-through in the history of Computer Science: the <a href="http://swtch.com/duffs-device/td-1983.txt">Duff's device</a>.</p>

	dsend(to, from, count)
	char *to, *from;
	int count;
	{
		int n = (count + 7) / 8;
		switch (count % 8) {
		case 0: do { *to = *from++;
		case 7:      *to = *from++;
		case 6:      *to = *from++;
		case 5:      *to = *from++;
		case 4:      *to = *from++;
		case 3:      *to = *from++;
		case 2:      *to = *from++;
		case 1:      *to = *from++;
				   } while (--n > 0);
		}
	}

<p>Both clever and confusing, this device leverages C's relaxed specification of the <em>switch </em>statement to optimize a serial copy using <a href="http://en.wikipedia.org/wiki/Loop_unwinding">loop unwinding</a>. I can imagine most people being repulsed by the code above -- you're not alone. Even the code's discoverer said that he felt "a combination of pride and revulsion at this discovery."</p>
<p>But is Duff's device too clever? I think if you look at it in the original context (which was about real-time animation), it was a brilliant solution to the problem. That is not to say we should start using it in our everday work. Even ignoring issues with how different system architectures and compiler optimizations handle the device, is loop unwinding even useful? Most likely no. There are many ways to get your code to run faster, including new hardware.</p>
<p>How about this piece of code, found in the 3D engine of Quake III to calculate the square root of a float.</p>

	float InvSqrt (float x){
		float xhalf = 0.5f*x;
		int i = *(int*)&x;
		i = 0x5f3759df - (i>>1);
		x = *(float*)&i;
		x = x*(1.5f - xhalf*x*x);
		return x;
	}

<p>Notice the magical constant <code>0x5f3759df</code>. Where did that come from and what does it do? There is a brief explanation given <a href="http://www.beyond3d.com/content/articles/8/">here </a>about this constant. Basically it involves the <a href="http://en.wikipedia.org/wiki/Newton%27s_method">Newton-Raphson</a> method for approximating square roots.</p>
<p>Is this <code>InvSqrt</code> function unnecessarily clever? I'd say no, because 3D engines have always used mathematical models to draw speed and power from. This function is pretty straight-forward once you understand the math behind it. And in this case, we can't throw more hardware to increase performance, not unless we want to launch a game that can't even perform at 50% speed on the best gaming-rig currently available. (I'm reminded of <a href="http://en.wikipedia.org/wiki/Wirth%27s_law">Wirth's law</a> a little bit)</p>
<p>The point is, we need to pick and choose when to be clever. Principles and guidelines are useful, but they are not meant to be be followed 100% of the time. Aren't we, as programmers, paid for our ability to think? So think!</p>
