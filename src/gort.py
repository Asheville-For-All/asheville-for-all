## python 3.9

import os
import yaml #this uses pyyaml library
import markdown ##this uses python markdown https://python-markdown.github.io/reference/

def gortify(filename):
    """
    Takes a single .md file and outputs an assembled html file.
    
    Parameters:
    filename (str): an .md file, with a yaml section at the top, separated by "__\n" on the first and last lines.
    
    Returns:
    TK TK
    """ ## info on python docstrings here:https://www.geeksforgeeks.org/python-docstrings/

    fn = filename
    navBarObj = []
    frame = ""
    main = []
    mainstring = ""
    metadata = []
    header = ""
    footer = ""
    newFileName = fn.split('.')[0] + ".html"

    with open(fn) as f:
        m = f.read()
        main = m.split('---\n')
        main.pop(0)
        ## main now has two list items: the first is a YAML string, the second is the main HTML content.

    with open("frame.html") as f:
        frame = f.read()

    with open("header.html") as f:
        header = f.read()

    with open("footer.html") as f:
        footer = f.read()

    with open("navbar.yaml") as f:
        navBarObj = yaml.load(f.read())

    metadata = yaml.load(main[0])

    if 'title' in metadata:
        frame.replace("{{title}}", metadata.title)
    else:
        frame.replace("{{title}}", "Asheville For All")

        if 'action banner' in metadata and metadata["action banner"] == "y":
            frame.replace("{{action banner}}", "") #TODO
        else:
            frame.replace("{{action banner", "")

    frame.replace("{{header}}", header)
    frame.replace("{{footer}}", footer)

    mainstring = '<main class="container">' + markdown.markdown(main[1]) + '</main>'
    frame.replace("{{main}}", mainstring)

    frame.replace("{{navbar}}", get_Navbar_code(navBarObj, newFileName))

    ##TODO just need to output the file now

    f=open(newFileName, "w")
    f.write(frame)
    f.close()

    print("Done! Output file: " + newFileName)

## ----HELPER CODE FOR NAVBAR: ---- ##

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

filename = input("Enter a filename (example: 'index.md'): ")

if os.path.isfile(filename) == True:
    gortify(filename)
else:
    print("Sorry, this doesn't appear to be a valid file name.")






