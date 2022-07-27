# for processing action banners
import yaml
import os
import re
import datetime

def getABObject(abFileName):
    '''
    The "ABObject" being created is a list of two things: metadata, and the html code for the action banner.

    Parameters:
    abFileName (str): An html file with optional YAML metadata at the top.
    '''
    with open(abFileName) as f:
        rawStr = f.read()
        rString = "^---$"
        #TODO make the YAML optional, and search to see if it's there.
        x = re.compile(rString, re.MULTILINE)
        arr = x.split(rString)
        if arr[0] == "" or arr[0] == "\n":
            arr.pop(0)
        if arr[-1] == "" or arr[-1] == "\n":
            arr.pop(-1)
        return arr

def getABString(abObject):
    if datetime.date.fromisoformat(abObject[0]) < datetime.date.today():
        return ""
    else:
        return abObject[1]


