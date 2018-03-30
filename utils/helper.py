import json

class Helper:

    def dump(data, label=""):
        print("\n=================================DUMP" + (": " + label if label else "") + \
         "====================================\n")
        
        try:
            print(json.dumps(data, indent=4))
        except TypeError:
            print(data)
            
        print("\n===================================*****========================================\n")
