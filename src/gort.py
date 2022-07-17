## python 3.9

import os
import re
import copy
import yaml #this uses pyyaml library
import markdown ##this uses python markdown https://python-markdown.github.io/reference/

def gortify(filename):
    """
    Takes a single .md file and outputs an assembled html file.
    
    Parameters:
    filename (str): an .md file, with a yaml section at the top, separated by "---\n" on the first and last lines.
    """ ## info on python docstrings here:https://www.geeksforgeeks.org/python-docstrings/

    fn = filename
    navBarObj = []
    frame = ""
    main = []
    mainstring = ""
    metadata = []
    header = ""
    footer = ""
    actionBanner = ""

    with open(fn) as f:
        m = f.read()
        main = splitMain(m)

    with open("frame.html") as f:
        frame = f.read()

    with open("header.html") as f:
        header = f.read()

    with open("footer.html") as f:
        footer = f.read()

    with open("navbar.yaml") as f:
        navBarObj = yaml.load(f.read())

    if os.path.exists("action-banner.html"):
        with open("action-banner.html") as f:
            actionBanner = f.read()

    metadata = yaml.load(main[0])

    if 'multi-page' in metadata:
        buildMultiPage(frame, header, footer, metadata, main, navBarObj, fn, actionBanner)

    else:
        buildSinglePage(frame, header, footer, metadata, main, navBarObj, fn, actionBanner)

def get_Navbar_code(navMapDictObj, activePageURL):
    """
    This function makes the html code for the navbar of a given page.

    Parameters:
    navMapDictObj (arr): This is an array of navbar items, as defined by a yaml file. It may include navbar categories with nested items.
    activePageURL (str): the filename for which the navbar is being generated, for example, "index.html".

    Returns:
    str: the entire html code for a navbar.
    """
    n = navMapDictObj
    a = activePageURL
    pre = '''
    <nav class="navbar navbar-expand-sm navbar-light container">

      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">

          <ul class="navbar-nav">
    '''
    post = '''
    </ul>
        </div>
      </div>
    </nav>
    '''
    returnString = pre
    for i in n:
        if n[i].type == "page":

            s = '"<li class="nav-item"><a class="nav-link'
            if n[i].url == a:
                s = s + ' active" aria-current="page" '
            else:
                s = s + '" '
            s = s + 'href="' + n[i].url + '" '
            if 'target' in n[i]:
                if n[i].target == "blank":
                    s = s + 'target="_blank"'
            s = s + '>'
            nameString = ''
            if 'svg' in n[i]:
                nameString = n[i].name + " " + n[i].svg
            else:
                nameString = n[i].name
            s = s + nameString + '</a></li>'
            returnString = returnString + s
        if n[i].type == "category":
            returnString = returnString + get_Dropdown_Code(n[i].collection, a)
    returnString = returnString + post
    return returnString

def get_Dropdown_Code(subObject, activePageURL):
    so = subObject
    a = activePageURL
    pre = '''
    <li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">Learn More</a><ul class="dropdown-menu" aria-labelledby="navbarDropdown">
    '''
    post = '</ul></li>'
    returnString = pre
    for i in so:
        s = '<li><a class="dropdown-item'
        if so[i].url == a:
            s = s + ' active" aria-current="page" '
        else:
            s = s + '" '
        s = s + 'href="' + so[i].url + '" '
        if 'target' in so[i]:
            if so[i].target == "blank":
                s = s + 'target="_blank"'
        s = s + '>'
        nameString = ''
        if 'svg' in so[i]:
            nameString = so[i].name + " " + so[i].svg
        else:
            nameString = so[i].name
        s = s + nameString + "</a></li>"
        returnString = returnString + s
    returnString = returnString + post

def buildSinglePage(frame, header, footer, metadata, main, navBarObj, filename, actionBanner=""):

    newFileName = filename.split('.')[0] + ".html"

    if 'title' in metadata:
        frame.replace("{{title}}", metadata.title)
    else:
        frame.replace("{{title}}", "Asheville For All")

        if 'action banner' in metadata and metadata["action banner"] == "y":
            frame.replace("{{action banner}}", actionBanner)
        else:
            frame.replace("{{action banner", "")

    frame.replace("{{header}}", header)
    frame.replace("{{footer}}", footer)

    mainstring = '<main class="container">' + markdown.markdown(main[1]) + '</main>'
    frame.replace("{{main}}", mainstring)

    frame.replace("{{navbar}}", get_Navbar_code(navBarObj, newFileName))

    f=open(newFileName, "w")
    f.write(frame)
    f.close()

def buildMultiPage(frame, header, footer, metadata, main, navBarObj, filename, actionBanner=""):
    numPages = len(metadata["multi-page"]["tabs"])
    count = 0
    rootFileName = filename.split('.')[0]
    for t in metadata["multi-page"]["tabs"]:
        count = count + 1
        newFileName = rootFileName + "-" + str(count) + ".html"
        newPage = copy.copy(frame)
        if 'title' in metadata:
            newPage.replace("{{title}}", metadata.title)
        else:
            newPage.replace("{{title}}", "Asheville For All")
        if 'action banner' in metadata and metadata["action banner"] == "y":
            newPage.replace("{{action banner}}", actionBanner)
        else:
                newPage.replace("{{action banner", "")
        newPage.replace("{{header}}", header)
        newPage.replace("{{footer}}", footer)
        mainstring = '<main class="container"><h1>' + metadata["multi-page"]["common-heading"] + '</h1>'
        mainstring = mainstring + generateTabBar(count, metadata["multi-page"]["tabs"], newFileName)
        mainstring = mainstring + markdown.markdown(main[count]) + generateMultiPageBottomButtons(numPages, count, rootFileName) + "</main>"
        newPage.replace("{{main}}", mainstring)
        newPage.replace("{{navbar}}", get_Navbar_code(navBarObj, newFileName))
        f=open(newFileName, "w")
        f.write(newPage)
        f.close()

def generateMultiPageBottomButtons(numOfTabs, count, rootFileName):
    prevFileName = ""
    nextFileName = ""
    if count == 1:
        prevFileName = ""
    else:
        prevFileName = rootFileName + "-" + str(count - 1) + ".html"
    if count == numOfTabs:
        nextFileName = ""
    else:
        nextFileName = rootFileName + "-" + str(count + 1) + ".html"

    s = '<nav class="mt-5"><ul class="pagination">'
    if count == 1:
        s += '<li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>'
    else:
        s += '<li class="page-item"><a class="page-link" href="' + prevFileName + '">Previous</a></li>'
    if count == numOfTabs:
        s += '<li class="page-item disabled"><a class="page-link" href="#">Next</a></li>'
    else:
        s += '<li class="page-item"><a class="page-link" href="' + nextFileName + '">Next</a></li>'
    s += '</ul></nav>'
    return s

def generateTabBar(count, tabList, newFilename): #TODO This is wrong. It's putting the same filename in every tab. I need to use the rootFileName, not the newFileName, and build it back out for each tab. Make sure to change newFileName to rootFileName where it's being called too.
    s = '''<div class="mb-5 mt-5"><ul class="nav nav-tabs nav-justified">'''
    post = '''</ul></div>'''
    i = 0
    for t in tabList:
        i= i+1
        if count == i:
            s = s + '<li class="nav-item"><a class="nav-link active" aria-current="page" href="' + newFilename + '">' + tabList[i-1] + '</a></li>'
        else:
            s = s + '<li class="nav-item"><a class="nav-link" aria-current="page" href="' + newFilename + '">' + tabList[i-1] + '</a></li>'
    s = s + post
    return s

def splitMain(str):
    '''This takes the content of an .md file, and splits it apart at the "---" lines. That way you get a array with the YAML info first, and then the page (or pages, if its a multi-page .md file) next.
    
    Parameters:
    str (str): The content of a markdown file, with a YAML section at the top.
    
    Returns:
    An array of strings, the first string being the YAML metadata, and subsequent string or strings being different main page content.'''
    rString = "^(---)$"
    x = re.compile(rString, re.MULTILINE)
    arr = x.split(str)
    if arr[0] == "" or arr[0] == "\n":
        arr.pop(0)
    if arr[-1] == "" or arr[-1] == "\n":
        arr.pop(-1)
    return arr

def emDashReplacer(str):
    '''Replaces three dashes with an em dash. Note that the three dashes can't appear at the very start or the very end of a line. They should be surrounded by spaces or letters.'''
    rString = "(?<=.)---(?=.)"
    x = re.compile(rString)
    return x.sub("—", str) #note that this character is an em-dash

## Main Code:

filename = input("Enter a filename (example: 'index.md'): ")

if os.path.isfile(filename) == True:
    gortify(filename)
else:
    print("Sorry, this doesn't appear to be a valid file name.")








