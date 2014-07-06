Alice Issue Tracker for Brackets
================================

This Bracket's extension shows you all the issues from a Github repository. It is under development, so if you have bugs or new ideas let me know in the brackets-dev google group, or throught a new issue: https://github.com/Nullpo/Alice

To install it, you can download Alice with the Extensions manager of Brackets. Or you can install it manually cloning this repository:

```
$ cd $BRACKETS_HOME/extensions/user
$ git clone git@github.com:Nullpo/Alice.git
```

First steps
-----------

After installing Alice, you can see the Alice icon in the toolbar on your right:

![alt text](http://nullpo.github.io/Alice/images/img1.png)


Click it, and now you see the Alice panel for your project:

![alt text](https://raw.githubusercontent.com/Nullpo/Alice/master/readme_files/img2.png)


If you click into an Issue title, you can see the details of it.

![alt text](https://raw.githubusercontent.com/Nullpo/Alice/master/readme_files/img3.png)

![alt text](https://raw.githubusercontent.com/Nullpo/Alice/master/readme_files/img4.png)

To have full access to your issues, you need to provide us a personal access token. If you click the "settings" button, you will see this:

![alt text](https://raw.githubusercontent.com/Nullpo/Alice/master/readme_files/img5.png)

Common problems
---------------

If your actual project doesn't have a Github repository in the "origin" remote repository, maybe you will see this:

![alt text](https://raw.githubusercontent.com/Nullpo/Alice/master/readme_files/err0.png)

This can be solved by calling "origin" the Github remote repository.


If your didn't configure your personal access token, Github provides a 60-request-quota. If Alice do more request than that, probably you will see this message:

![alt text](https://raw.githubusercontent.com/Nullpo/Alice/master/readme_files/err2.png)

If your access token doesn't have permission to access your private repositories, you will see this message:

![alt text](https://raw.githubusercontent.com/Nullpo/Alice/master/readme_files/err1.png)


If your project don't use git, you will see this message:

![alt text](https://raw.githubusercontent.com/Nullpo/Alice/master/readme_files/err4.png)



Contact
-------

Send me an email to pablo.codeiro [at] gmail.com

If you like the application, send me an e-mail, or follow me in twitter! https://twitter.com/thegreyhat
