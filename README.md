# KP Logger
Chrome extension for logging page data for KupujemProdajem listings.  
This allows sellers to backup the text located in the title, price and body of their listings  
and save those string values for the next time they need to create the same listing or  
refresh the existing listing with this data.
  
Press "SELECT PAGE" to save the data that you are viewing.  
Press "EXPORT" to generate and download a CVS file.  
    By default the data that will be exported is:  
        - Title
        - Price  
        - Body

Press "DELETE ALL" to clear the list.  
Press the red "X" on the right side of a listing to remove that individual listing from the list.  
  
If the exported data isn't formatted correctly, follow the instructions at:  
https://support.microsoft.com/en-us/office/import-or-export-text-txt-or-csv-files-5250ac4c-663c-47ce-937b-339e391393ba  
  
You'll need to scroll down to "Change the default list separator for new text files"  
in order for this to work. This way Excel will know that anywhere it sees a comma,  
that it represents a delimiter and move the text after that into the next column.  
