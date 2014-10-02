---
created_at: 2014-03-20 23:00Z
layout: post
title: i18n with tagged template strings in ECMAScript 6
tags: [javascript, es6, i18n]
---

One of the new features coming to ECMAScript 6 (ES6), the next version of
JavaScript standards, is the **template string**. The simplest use cases for
template strings are creating multiline strings, and doing string interpolation.

Multiline string:
{% highlight javascript %}
let s = `This is
a multiline
string`;
{% endhighlight %}

String interpolation:
{% highlight javascript %}
let firstName = 'Bob', lastName = 'Smith';
let msg = `Hello ${firstName} ${lastName}!`; // 'Hello Bob Smith!'
{% endhighlight %}

You can also **tag** a template string by adding an expression before it.
When a template string is tagged, the literals and substitutions are passed to
the tag function, and whatever returns from the function is the resulting value.

{% highlight javascript %}
function foo(literals, ...values) {
  return 42;
}

foo`What do you get if you multiply ${6} by ${9}?`; // 42

// In the foo function:
//   literals = ['What do you  get if you multiply ', ' by ', '?']
//   values[0] = 6
//   values[1] = 9
{% endhighlight %}

This feature opens up some interesting syntactic sugar for producing and manipulating
content. One such example is **Internationalization** or **i18n**.

In this post we'll look at:

* Implementing a basic i18n tag function for translating messages.
* Localization (l10n) of values using the **Intl** native object.

This post requires some knowledge of new ES6 features such as array comprehensions,
arrow functions, spreads, etc. If you are new to ES6, I suggest brushing up on the
basics. I found Ariya's [posts on ES6](http://ariya.ofilabs.com/tag/es6) to be useful.

## The i18n tag

Let's start with an example of how we want to use the `i18n` tag.

{% highlight javascript %}
let name = 'Bob';
let amount = 100;
i18n`Hello ${name}, you have ${amount}:c(CAD) in your bank account.`
{% endhighlight %}

Here, we are expecting to translate the literals into the language of our choosing.
We are also adding optional annotations to the substitutions. In this case, the
`amount` value has the `:c(CAD)` annotation, which marks it as a currency **type**
that is in Canadian Dollars (CAD).

If we translated this string to German, for example, we expect the result to be
`'Hallo Bob, Sie haben 1.234,56 $CA auf Ihrem Bankkonto.'` Note that the currency
amount has thousands and decimal separator as per German locale.

## Implementation

We'll allow configuration of our `i18n` tag through `I18n.use`.

{% highlight javascript %}
let messageBundle_de = {
  'Hello {0}, you have {1} in your bank account.': 'Hallo {0}, Sie haben {1} auf Ihrem Bankkonto.'
};

let i18n = I18n.use({
  locale: 'de-DE',
  defaultCurrency: 'EUR',
  messageBundle: messageBundle_de});

// Now we can translate our string to German, with the Euro being the default currency

i18n`Hello ${name}, you have ${amount}:c(CAD) in your bank account.`
// => Hallo Bob, Sie haben 1.234,56 $CA auf Ihrem Bankkonto.
{% endhighlight %}

Let's start with implementing the `I18n.use` method, which should return the
tag function.


{% highlight javascript %}
let I18n = {
  use({lang, defaultCurrency, messageBundle}) {
    I18n.lang = lang;
    I18n.defaultCurrency = defaultCurrency;
    I18n.messageBundle = messageBundle;
    return I18n.translate;
  },

  translate(literals, ...values) {
    let translationKey = ...;
    let translationString = I18n.messages[translationKey];

    if (translationString) {
      let localizedValues = ...;
      return I18n._buildMessage(translationString, ...localizedValues);
    }

    return 'Error: translation missing!';
  }
};
{% endhighlight %}

The `translationString` should match the keys in our message bundle. In our previous
German translation example, this would be `'Hello {0}, you have {1} in your bank account.'`.

The `localizedValues` array is a map of substitution `values` in their localized
forms. For example, in German `1000.12` should show as `'1.000,12'`.

Now, I will show a full implementation of the library.

{% highlight javascript %}
// Matches optional type annotations in i18n strings.
// e.g. i18n`This is a number ${x}:n(2)` formats x as number
//      with two fractional digits.
const typeInfoRegex = /^:([a-z])(\((.+)\))?/;

let I18n = {
  use({locale, defaultCurrency, messageBundle}) {
    I18n.locale = locale;
    I18n.defaultCurrency = defaultCurrency;
    I18n.messageBundle = messageBundle;
    return I18n.translate;
  },

  translate(literals, ...values) {
    let translationKey = I18n._buildKey(literals);
    let translationString = I18n.messageBundle[translationKey];

    if (translationString) {
      let typeInfoForValues = literals.slice(1).map(I18n._extractTypeInfo);
      let localizedValues = values.map((v, i) => I18n._localize(v, typeInfoForValues[i]));
      return I18n._buildMessage(translationString, ...localizedValues);
    }

    return 'Error: translation missing!';
  },

  _localizers: {
    s /*string*/: v => v.toLocaleString(I18n.locale),
    c /*currency*/: (v, currency) => (
      v.toLocaleString(I18n.locale, {
        style: 'currency',
        currency: currency || I18n.defaultCurrency
      })
    ),
    n /*number*/: (v, fractionalDigits) => (
      v.toLocaleString(I18n.locale, {
        minimumFractionDigits: fractionalDigits,
        maximumFractionDigits: fractionalDigits
      })
    )
  },

  _extractTypeInfo(literal) {
    let match = typeInfoRegex.exec(literal);
    if (match) {
      return {type: match[1], options: match[3]};
    } else {
      return {type: 's', options: ''};
    }
  },

  _localize(value, {type, options}) {
    return I18n._localizers[type](value, options);
  },

  // e.g. I18n._buildKey(['', ' has ', ':c in the']) == '{0} has {1} in the bank'
  _buildKey(literals) {
    let stripType = s => s.replace(typeInfoRegex, '');
    let lastPartialKey = stripType(literals[literals.length - 1]);
    let prependPartialKey = (memo, curr, i) => `${stripType(curr)}{${i}}${memo}`;

    return literals.slice(0, -1).reduceRight(prependPartialKey, lastPartialKey);
  },

  // e.g. I18n._formatStrings('{0} {1}!', 'hello', 'world') == 'hello world!'
  _buildMessage(str, ...values) {
    return str.replace(/{(\d)}/g, (_, index) => values[Number(index)]);
  }
};

// Usage
let messageBundle_fr = {
  'Hello {0}, you have {1} in your bank account.': 'Bonjour {0}, vous avez {1} dans votre compte bancaire.'
};

let messageBundle_de = {
'Hello {0}, you have {1} in your bank account.': 'Hallo {0}, Sie haben {1} auf Ihrem Bankkonto.'
};

let messageBundle_zh_Hant = {
  'Hello {0}, you have {1} in your bank account.': '你好{0}，你有{1}在您的銀行帳戶。'
};

let name = 'Bob';
let amount = 1234.56;
let i18n;

i18n = I18n.use({locale: 'fr-CA', defaultCurrency: 'CAD', messageBundle: messageBundle_fr});
console.log(i18n `Hello ${name}, you have ${amount}:c in your bank account.`);

i18n = I18n.use({locale: 'de-DE', defaultCurrency: 'EUR', messageBundle: messageBundle_de});
console.log(i18n `Hello ${name}, you have ${amount}:c in your bank account.`);

i18n = I18n.use({locale: 'zh-Hant-CN', defaultCurrency: 'CNY', messageBundle: messageBundle_zh_Hant});
console.log(i18n `Hello ${name}, you have ${amount}:c in your bank account.`);
{% endhighlight %}

One important thing to note here is that the `_localizers` are using the
native [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
object to localize values.


### ES Internationalization API

The [Internationalization API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
adds new methods to native types, such as `Number.prototype.toLocaleString()` and `Date.prototype.toLocaleDateString()`.

These methods delegate to three objects: `Intl.Collator`, `Intl.NumberFormat`, and `Intl.DateTimeFormat`. The
collator object enables string comparisons to be language sensitive, while the other two are pretty self-explanatory.

An option of the `NumberFormat` we took advantage of in our implementation is the `style`. The style value can be
`decimal` (default), `currency`, or `percent`. In our case, we used both the currency and decimal support for the `:c` and
`:n` annotations respectively. For number localization, we also support rounding of fractional digits through the use of
`minimumFractionDigits` and `maximumFractionDigits` options.


## Example usages

Now, we can translate our original string into different languages by configuring
the `I18n` object using corresponding locales and message bundle.

{% highlight javascript %}
let name = 'Bob';
let amount = 1234.56;
let i18n;

let messageBundle_fr = {
  'Hello {0}, you have {1} in your bank account.': 'Bonjour {0}, vous avez {1} dans votre compte bancaire.'
};
let messageBundle_de = {
  'Hello {0}, you have {1} in your bank account.': 'Hallo {0}, Sie haben {1} auf Ihrem Bankkonto'
};
let messageBundle_zh_Hant = {
  'Hello {0}, you have {1} in your bank account.': '你好{0}，你有{1}在您的銀行帳戶。'
};

i18n = I18n.use({locale: 'fr-CA', defaultCurrency: 'CAD', messageBundle: messageBundle_fr});
i18n`Hello ${name}, you have ${amount}:c in your bank account.`;
// => 'Bonjour Bob, vous avez 1 234,56 $CA dans votre compte bancaire.'

i18n = I18n.use({locale: 'de-DE', defaultCurrency: 'EUR', messageBundle: messageBundle_de});
i18n`Hello ${name}, you have ${amount}:c in your bank account.`;
// => 'Hallo Bob, Sie haben 1.234,56 € auf Ihrem Bankkonto.'

i18n = I18n.use({locale: 'zh-Hant-CN', defaultCurrency: 'CNY', messageBundle: messageBundle_zh_Hant});
i18n`Hello ${name}, you have ${amount}:c in your bank account.`;
// => '你好Bob，你有￥1,234.56在您的銀行帳戶。'
{% endhighlight %}


Here's a link to an [ES6 Fiddle](http://www.es6fiddle.net/i0rj2cc9/) for a live demo.

## Concluding thoughts

The tagged template string can be used to provide powerful DSL to JavaScript libraries.
I chose to try my hand at adding simple i18n support. There are still a lot of pieces
missing to provide a comprehensive i18n solution, but I hope to have shown how one
may go about building out this framework.

Pluralization can be a very tricky thing to tackle, and I am not qualified as of this
writing to understand all the nuances of implementing this feature. Perhaps with
a little more thinking, there may be some hope to add it in as well.

In any case, I do see a lot of potential in tagged template strings to add clean, clear
syntax for library functionalities.

<small>Edit (2014/03/21): Fixed German translation and added a conclusion section.</small>

<small>Edit (2014/10/01): Updated examples to not use array comprehension since they were removed in ES6</small>
