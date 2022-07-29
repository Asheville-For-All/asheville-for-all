# for processing action banners
import yaml
import re
import datetime

def getABObject(abFileName):
    '''
    The "ABObject" being created is a list of two things: metadata, and the html code for the action banner.

    Parameters:
    abFileName (str): An html file with optional YAML metadata at the top.
    '''
    with open(abFileName) as f:
        arr = []
        rawStr = f.read()
        rString = "^---$"
        #TODO make the YAML optional, and search to see if it's there.
        x = re.compile(rString, re.MULTILINE)
        if x.search(rawStr) == None:
            arr[0] = ""
            arr[1] = rawStr
        else:
            arr = x.split(rawStr)
            if arr[0] == "" or arr[0] == "\n":
                arr.pop(0)
            if arr[-1] == "" or arr[-1] == "\n":
                arr.pop(-1)
            arr[0] = yaml.safe_load(arr[0])
        return arr

def getABString(abObject):
    if abObject[0] == "":
        return abObject[1]
    if abObject[0].get("expire", "") == "":
        return abObject[1]
    elif datetime.date.fromisoformat(abObject[0].get("expire")) < datetime.date.today():
        return ""
    else:
        return abObject[1]


