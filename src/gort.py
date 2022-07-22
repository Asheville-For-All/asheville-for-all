## python 3.9

import os
import sys
import re
import copy
import yaml #this uses pyyaml library
import markdown ##this uses python markdown https://python-markdown.github.io/reference/

def printc(color, string):
  '''Print in a chosen color. 
  
  parameters:
  color (str): Options are yellow, green, red, blue, purple, cyan.
  string (str): the string you want printed.'''
  colors = {"yellow":"\033[0;33m", "green":"\033[1;32m", "red":"\033[1;31m", "blue":"\033[1;34m", "purple":"\033[1;35m", "cyan":"\033[1;36m"}
  print(colors["color"] + string + "\033[00m")

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
        navBarObj = yaml.safe_load(f.read())

    printc("purple", "Here's what your navbar object looks like:\n"+ str(navBarObj))

    if os.path.exists("action-banner.html"):
        with open("action-banner.html") as f:
            actionBanner = f.read()

    metadata = yaml.safe_load(main[0])

    printc("yellow","Loaded metadata: " + str(metadata))

    if 'multi-page' in metadata:
        buildMultiPage(frame, header, footer, metadata, main, navBarObj, fn, actionBanner)

    else:
        buildSinglePage(frame, header, footer, metadata, main, navBarObj, fn, actionBanner)

def get_Navbar_code(navMapDictObj, activePageURL): #TODO looks like there's some tiny bugs in here causing quote marks on the final nav bar.
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
    for o in n:
        if o["type"] == "page":

            s = '"<li class="nav-item"><a class="nav-link'
            if o["url"] == a:
                s = s + ' active" aria-current="page" '
            else:
                s = s + '" '
            s = s + 'href="' + o["url"] + '" '
            if 'target' in o:
                if o["target"] == "blank":
                    s = s + 'target="_blank"'
            s = s + '>'
            nameString = ''
            if 'svg' in o:
                nameString = o["name"] + " " + o["svg"]
            else:
                nameString = o["name"]
            s = s + nameString + '</a></li>'
            returnString = returnString + s
        if o["type"] == "category":
            returnString = returnString + get_Dropdown_Code(o["name"],o["collection"], a)
    returnString = returnString + post
    return returnString

def get_Dropdown_Code(name, subObject, activePageURL):
    so = subObject
    a = activePageURL
    pre = '''
    <li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">''' + name + '''</a><ul class="dropdown-menu" aria-labelledby="navbarDropdown">
    '''
    post = '</ul></li>'
    returnString = pre
    for o in so:
        s = '<li><a class="dropdown-item'
        if o["url"] == a:
            s = s + ' active" aria-current="page" '
        else:
            s = s + '" '
        s = s + 'href="' + o["url"] + '" '
        if 'target' in o:
            if o["target"] == "blank":
                s = s + 'target="_blank"'
        s = s + '>'
        nameString = ''
        if 'svg' in o:
            nameString = o["name"] + " " + o["svg"]
        else:
            nameString = o["name"]
        s = s + nameString + "</a></li>"
        returnString = returnString + s
    returnString = returnString + post
    return returnString

def buildSinglePage(frame, header, footer, metadata, main, navBarObj, filename, actionBanner=""):

    newFileName = filename.split('.')[0] + ".html"

    if 'title' in metadata:
        frame = frame.replace("{{title}}", metadata["title"])
    else:
        frame = frame.replace("{{title}}", "Asheville For All")

        if 'action banner' in metadata and metadata["action banner"] == "y":
            frame = frame.replace("{{action banner}}", actionBanner)
        else:
            frame = frame.replace("{{action banner}}", "")

    frame = frame.replace("{{header}}", header)
    frame = frame.replace("{{footer}}", footer)

    mainstring = '<main class="container">' + markdown.markdown(main[1]) + '</main>'
    frame = frame.replace("{{main}}", mainstring)

    frame = frame.replace("{{navbar}}", get_Navbar_code(navBarObj, newFileName))

    f=open(newFileName, "w")
    f.write(frame)
    f.close()
    printc("green", "Created file: " + newFileName)

def buildMultiPage(frame, header, footer, metadata, main, navBarObj, filename, actionBanner=""):
    numPages = len(metadata["multi-page"]["tabs"])
    count = 0
    rootFileName = filename.split('.')[0]
    for t in metadata["multi-page"]["tabs"]:
        count = count + 1
        newFileName = rootFileName + "-" + str(count) + ".html"
        if "alternate-numbering" in metadata["multi-page"] and metadata["multi-page"]["alternate-numbering"] == "y" and count == 1:
            newFileName = rootFileName + ".html"
        newPage = copy.copy(frame)
        if 'title' in metadata:
            newPage = newPage.replace("{{title}}", metadata["title"])
        else:
            newPage = newPage.replace("{{title}}", "Asheville For All")
        if 'action banner' in metadata and metadata["action banner"] == "y":
            newPage = newPage.replace("{{action banner}}", actionBanner)
        else:
            newPage = newPage.replace("{{action banner", "")
        newPage = newPage.replace("{{header}}", header)
        newPage = newPage.replace("{{footer}}", footer)
        mainstring = '<main class="container"><h1>' + metadata["multi-page"]["common-heading"] + '</h1>'
        mainstring = mainstring + generateTabBar(count, metadata["multi-page"]["tabs"], rootFileName, metadata["multi-page"]["alternate-numbering"])
        mainstring = mainstring + markdown.markdown(main[count]) + generateMultiPageBottomButtons(numPages, count, rootFileName, metadata["multi-page"]["alternate-numbering"]) + "</main>"
        newPage = newPage.replace("{{main}}", mainstring)
        newPage = newPage.replace("{{navbar}}", get_Navbar_code(navBarObj, newFileName))
        f=open(newFileName, "w")
        f.write(newPage)
        f.close()
        printc("green", "Created file: " + newFileName)

def generateMultiPageBottomButtons(numOfTabs, count, rootFileName, alternateNumbering):
    prevFileName = ""
    nextFileName = ""
    
    if count == 1:
        prevFileName = ""
    else:
        if alternateNumbering == "y" and count == 2:
            prevFileName = rootFileName + ".html"
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

def generateTabBar(count, tabList, rootFileName, alternateNumbering):
    s = '''<div class="mb-5 mt-5"><ul class="nav nav-tabs nav-justified">'''
    post = '''</ul></div>'''
    i = 0
    for t in tabList:
        i= i+1
        newFileName = rootFileName + "-" + str(i) + ".html"
        if alternateNumbering == "y" and i==1:
            newFileName = rootFileName + ".html"
        if count == i:
            s = s + '<li class="nav-item"><a class="nav-link active" aria-current="page" href="' + newFileName + '">' + tabList[i-1] + '</a></li>'
        else:
            s = s + '<li class="nav-item"><a class="nav-link" aria-current="page" href="' + newFileName + '">' + tabList[i-1] + '</a></li>'
    s = s + post
    return s

def splitMain(string):
    '''This takes the content of an .md file, and splits it apart at the "---" lines. That way you get a array with the YAML info first, and then the page (or pages, if its a multi-page .md file) next.
    
    Parameters:
    str (str): The content of a markdown file, with a YAML section at the top.
    
    Returns:
    An array of strings, the first string being the YAML metadata, and subsequent string or strings being different main page content.'''
    rString = "^---$"
    x = re.compile(rString, re.MULTILINE)
    arr = x.split(string)
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

print("Current working directory is: " + os.getcwd())
print("Directory of script is: " + os.path.dirname(sys.argv[0]))
os.chdir(os.path.dirname(sys.argv[0]))
printc("purple", "Changing working directory to: " + os.path.dirname(sys.argv[0]))

filename = input("\033[1;32mEnter a filename (example: 'index.md') or type 'ALL' for all html files: \033[00m")

if filename == "ALL" or filename == "all":
    count = 0
    printc("blue","Processing all '.md' files in the current directory.")
    for x in os.listdir():
        if x.endswith('.md'):
            print("\033[1;32m Getting started on " + x + " . . .\033[00m")
            gortify(x)
            count += 1
    printc("blue", "Completed processing all markdown files. Processed " + str(count) " files.")
elif os.path.exists(os.path.join(os.getcwd(), filename)):
    print("\033[1;32m Getting started on " + filename + " . . .\033[00m")
    gortify(filename)
else:
    printc("red", "Sorry, this doesn't appear to be a valid file name.")








