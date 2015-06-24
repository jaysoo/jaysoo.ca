---
created_at: 2015-06-24 22:35Z
layout: post
title: When Learning, Attitude and Approach Matter
tags: [learning]
---

As programmers, one of the most important skill to have is being able to learn quickly. It doesn't
matter that you know frameworks X and Y, or languages Foo and Bar. What is hot and not will change
several times throughout our career, but the skill to learn new abilities will always be in demand.

In this post, I want to look at what it takes to be a good learner, as well as some techniques we
can employ to help us along the way. 

## The Purpose Of Learning

We face many problems everyday. Some problems are technical in nature, while others could
be business problems, social problems, etc. Picture a big *problem space* that consists of all the problems
we could solve. The act of learning then expands out *solution space*, with in turn would potentially
lead to solutions for our problems.

![](/images/problem-vs-solution-space.svg)

When a solution is missing, it is our responsibility to *learn* it.

## Start By Setting The Right Goals

There are two classes of learning goals we can have.

1. **Performance goals**, in which individuals are concerned with gaining favourable *judgments* of
   their competence.
2. **Learning goals**, in which individuals are concerned with *increasing* their competence.

Dr. Carol Dweck has done research that shows that people with *performance goals* tend to view the amount of effort
exerted in learning as an index into their ability [1]. Exerting high amount of effort means an
individual has low ability. Even more dangerous, these individuals view failures as warning signs that
they will be judged as having low ability. Therefore when high effort is required, these individuals
may experience high anxiety.

Compare this to people with *learning goals*, who view effort as a mean of activating an ability. That is,
putting effort into something will result in you increasing your ability. These individuals also view
failures as an indication that the task will require even more effort. As well, exerting effort in the service
of learning may bring intrinsic rewards and pleasure.

It is important that we try to prioritize learning goals over performance goals. Of course, it is not
realistic to completely avoid the latter. When we do reach for performance goals, it's important to still keep in mind
that failures are not an indication of personal deficiencies, but rather an sign that more effort is required
rather then a judgement of their ability.

We also need to keep our original performance goal in view and develop proper strategy/plan to meet that goal.

## Learning From Adversity

> The fact of the matter is that there will be nothing learned from any challenge in which we don't try our hardest.
Growth comes at the point of resistance. We learn by pushing ourselves and finding what really lies at the outer reaches
of our abilities.
<small>Josh Waitzkin, The Art of Learning</small> 

When faced with adversity, there are two response patterns that can determine whether individuals are successful in
overcoming said adversity.

1. The maladaptive **helpless** pattern is one that deters individuals from confronting obstacles or prevents
them from functioning effectively in the face of difficulty.

2. The adaptive **mastery-oriented** pattern is one in which individuals maintain a commitment to their goals
through periods of difficulty.

In Dr. Dweck's research [1], she found that during the onset of failures, children who exhibit the *helpless* pattern
tend to experience anxiety over their performance. They attributed the failures to personal deficiencies, and
much of them used diversionary tactics to bolster their own ego. For example, they may trivialize the task
at hand, or talk about how good they are in other things. These "helpless" children also tend to view further
effort as futile, as it is beyond their ability.

With mastery-oriented children, the obversation is that they did not give attributions for their failures.
They viewed unsolved problems as a challenge to be conquered through effort. They relished the opportunity
to reach a solution.

These same patterns have been observed in adults as well.

The takeaway here is that when we face challenges, we should focus on mastery through strategy and effort. Do
not let pride and ego get in the way of an opportunity to learn.

So what are some strategies we can employ to help us on our endeavours?

## Spaced Repetition

Everything we learn in our lifetime has an expiry date. Although you may not have realized it, that calculus you learned
in school years ago is probably not within your current abilities -- unless you've practiced it recently.

This phenomenon has been documented in research by psychologist Hermann Ebbinghaus. He found that your chance
of memory retention goes down drastically after the first few hours, and slowly declines after a few days.

![](/images/forgetting-curve.jpg)

All is not lost though, because we can employ a technique known as *spaced repetition* to combat this memory decay.

The technique is to reinforce what we learned by reviewing the materials in increasing intervals of time. After our
initial memorization of the material, we need a reminder of the material *soon* after in order to have a good chance of
remembering it. The second reminder will then follow a longer period of days compared to the first. And the third reminder
comes after an even longer period, and so on.

![](/images/forgetting-curve-repetition.jpg)

Practically, we need to first recognize the materials we want to remember. Once we know
what we want to remember, we need to set periodic reviews of those materials. For things that we *just* learned, we need
to do our reviews at least within the first couple of days, then we keep up the reviews with increasing intervals of time.

The implication here is that we need to dedicate time to revisit materials *in addition* to learning new materials. The
corollary is that we should be explicit about the things we are okay with forgetting, and stop review those things.
 
## Learning All The Things

> Half-a-skill beats a half-assed-skill.
<small>Kathy Sierra</small>

As we increase the breadth of our knowledge, we invariably decrease our depth in some. Imagine a full-stack
developer, whose knowledge spans from backend Rails code, to various database systems, to a bunch
of JavaScript frameworks. This full-stack developer may lack knowledge in certain parts of the Rails ecosystem,
or may not know exactly how parts of AngularJS work.

Now, compare this to a specialist developer, who may know the ins and outs of building a Rails backend, but cannot write
a single line of JavaScript code.

Which is better? Can't we just learn all the things?

In a talk by Kathy Sierra called *Making Badass Developers*, she talks about having three categories of skills.

1. Things we **can't** do, but need to.
2. Things we **can** do with **effort**.
3. Things we **mastered** and can do reliably with little effort.

You can picture learning as moving things from A to B, and from B to C.

![](/images/kathy-sierra-three-categories.png)

One of the problems that Kathy identifies is that people let way too many items pile up on B. That is, we have
a bunch of skills that we think we need, but we have to exert tremendous amounts of effort everytime we access
that those skills.

An easy solution for this is to move things back to A. We can be explicit about not learning a skill, and free up our
cognitive resource to pursue other skills. This option is great if it is actually open to us. The reality is that we
might not have a say in what skills we need for our job.

The other solution (perhaps more viable solution) that Kathy proposes is to **break a skill down to many sub-skills**.
For example, instead of mastering all of Rails, I might spend my efforts in learning [Arel](https://github.com/rails/arel)
really well because I find myself needing that knowledge quite often at work. I can further break "Rails" downs into smaller
skills, such as knowing how Active Records work, how [Nokigiri](https://github.com/sparklemotion/nokogiri)
works if I'm dealing with XML a lot, etc. What about AngularJS?
Do I really need to master directives, or can I get away with just knowing how to wire up services and controllers?

Be cognizant of how the skills or sub-skills we spend our efforts on actually **tie back to our learning or performance goals**.
Also keep in mind that any skils we acquire will have to be practiced over and over again using **spaced repetition**.

## Conclusion

As programmers, learning is something we have to do repeatedly over the course of our career. In order to achieve the best
results, it is important to make sure we set the right goals for ourselves.

If possible, use learning as a goal in and of itself. Don't let ego prevent us from learning in the face of adversity.

Be explicit about the skills you want to retain. Keep praticing those skills because you will forget them otherwise.

If a skill is too big to learn, try breaking it down into smaller sub-skills and master those.
 

## References and Further Readings

- [1] [A Social-Cognitive Approach to Motivation and Personality](http://web.stanford.edu/dept/psychology/cgi-bin/drupalm/system/files/A%20social-cognitive%20approach_0.pdf) - Dr. Carol Dweck, et al.
- [Making Badass Developers](https://www.youtube.com/watch?v=FKTxC9pl-WM) - talk by Kathy Sierra
- [Stop Treading Water: Learning to Learn](https://yow.eventer.com/yow-2014-1222/stop-treading-water-learning-to-learn-by-edward-kmett-1750) - talk by Edward Kmett