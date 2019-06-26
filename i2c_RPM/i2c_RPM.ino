#include <Wire.h>

#define SLAVE_ADDRESS 0x08

int buf= 70;
int bufreal=buf-1;
volatile unsigned long time[70];
int tic=0;
unsigned long RPM; 
unsigned long t=0;
int bufer_full=false;
void setup()
{
  //Serial.begin(9600);
  pinMode(2, INPUT); 
  attachInterrupt(digitalPinToInterrupt(2), tickk, FALLING); 

  Wire.begin(SLAVE_ADDRESS);
  Wire.onRequest(sendData);
 
}

void sendData()
{
  if(!bufer_full )
    {
      if(tic>1)
        {
          RPM=(tic-1)*60000/(time[tic-1]-time[0]);
        }
      else
        {
          RPM=0;
        }  
    }
  else
    {
     if(tic>0)
      {
        RPM=bufreal*60000/(time[tic-1]-time[tic]);
      }
     else
      {
       RPM=bufreal*60000/(time[bufreal]-time[0]); 
      } 
      
    }
   if(millis()-t>2000)
    {
      RPM=0;
    }


 
 Wire.write((const uint8_t*)&RPM,4);
   
}



void loop()
{
 
}

void tickk() 
{ 
  time[tic]=millis();
  t=time[tic];
  tic++; 
  if(tic>=buf) 
  {
    bufer_full=true;
    tic=0;
  }
}
