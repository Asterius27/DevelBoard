# DevelBoard
Software Architecture Project. This version of the application is still in beta so some features are limited and/or missing, below is a full list of the limitations and missing functionalities:

- Edit Profile has not been implemented yet
- Everyone can create a new challenge, whilst in the final version only admins can create new challenges
- When creating a challenge the test cases and the result cases must be formatted following the example given as a place holder in their respective fields
- Users can only undertake challenges once
- The leaderboard is a generic leaderboard that displays the percentage of correct answers of every user in the system, in the final version more than one leaderboard will be available and the leaderboards will be more specific
- The only supported language for the challenges is java, whereas in the final version more languages will be supported
- In the java code a user submits for a challenge he must provide the main method (defined as public static void main(String[] args))
- The main method has to print the final result using System.out.println()
- Everything the program outputs to standard output will be compared against the test cases
- Test cases are passed as args to the main method
- All other classes must be declared as static

In the final version most of these limitations will no longer be present.

## Example
For example if our challenge is to write a program that adds two numbers, then our program would be:
```
public static void main(String args[]) {
    System.out.println(Integer.valueOf(args[0]) + Integer.valueOf(args[1]));
}
```

## Deployment
This version of the application can only be run through docker, below are the commands that have to be used to build and run the application. Both commands have to be run in the main folder (where the docker-compose file is located).
```
docker-compose build
docker-compose up
```
