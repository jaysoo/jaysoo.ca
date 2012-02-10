---
layout: post
title: "Cascading: Include header in the output for text-delimited files"
tags: [java, cascading, hadoop, mapreduce]
created_at: 2012-02-10 15:13Z
---

I recently started working on pipelines using Hadoop to run MapReduce jobs. 
One of the pipelines I need to setup involves reading in two or more text-delimited 
files (e.g. CSV), join them on one or more fields (inner, outer, left, or right), 
then write out the resulting text-delimited file.

For example:
    
    foo,bar,faz
    1,A,lorem
    2,B,ipsum
    3,C,dolor

*Left* joined with:

	foo,bar,baz
	2,B,amet
	1,A,consectetur
	1,B,adipiscing


Should yield:

	foo,bar,faz,baz
	1,A,lorem,consectetur
	2,B,ipsum,amet
	3,C,dolor,

I am using [Cascading](http://www.cascading.org/) for building the pipeline, and everything was working great.
However, the output file did not contain the header as the first line, which was part of
the requirement.

For small files, it's not a big deal to prepend the header afterwards, but for very large files (&gt; 5GB),
it becomes too slow to do a prepend.

Luckily, building a pipeline with custom workflow is not that hard using Cascading. And with the help of
the [mailing list](http://groups.google.com/group/cascading-user/topics) I was able to come up with a custom
*Scheme* class that does what I needed.

{% highlight java %}
// TextDelimitedWithHeader

public class TextDelimitedWithHeader extends TextDelimited {
  // ...

  @SuppressWarnings("unchecked")
  public void sinkPrepare(HadoopFlowProcess flowProcess, SinkCall<Object[], OutputCollector> sinkCall) {
    super.sinkPrepare(flowProcess, sinkCall);

    Fields fields = this.getSinkFields();
    Tuple tuple = new Tuple();

    for(int i = 0; i < fields.size(); i++)
      tuple.add(fields.get(i));

    try {
      sinkCall.getOutput().collect(null, tuple);
    } catch(IOException e) {
      throw new IllegalStateException("failed to write header");
    }
  }
  @SuppressWarnings("unchecked")
  public void sinkPrepare(HadoopFlowProcess flowProcess, SinkCall<Object[], OutputCollector> sinkCall) {
    super.sinkPrepare(flowProcess, sinkCall);

    Fields fields = this.getSinkFields();
    Tuple tuple = new Tuple();

    for(int i = 0; i < fields.size(); i++)
      tuple.add(fields.get(i));

    try {
      sinkCall.getOutput().collect(null, tuple);
    } catch(IOException e) {
      throw new IllegalStateException("failed to write header");
    }
  }

}
{% endhighlight %}

I am using the *2.0.0-wip* version of Cascading, in which the *Scheme* class contains the *sinkPrepare* method,
which will be called before anything is written to the sink.


