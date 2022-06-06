# DigiLogger
Chrome extension for logging electronic components from DigiKey.  
  
Press "SAVE CURRENT PAGE" to save the component data that you are viewing.  
Press "EXPORT" to generate and download a CVS file.  
    By default the data that will be exported is:  
        - Digikey Part Number  
        - Digikey Link  
        - Description  
        - Detailed Description  
        - Manufacturer Part Number  

Press "CLEAR" to clear the list of components.  
Press the red "X" on the right side of a component to remove that individual component from the list.  
  
If the exported data isn't formatted correctly, follow the instructions at:  
https://support.microsoft.com/en-us/office/import-or-export-text-txt-or-csv-files-5250ac4c-663c-47ce-937b-339e391393ba  
  
You'll need to scroll down to "Change the default list separator for new text files"  
in order for this to work. This way Excel will know that anywhere it sees a comma,  
that it represents a delimiter and move the text after that into the next column.  
